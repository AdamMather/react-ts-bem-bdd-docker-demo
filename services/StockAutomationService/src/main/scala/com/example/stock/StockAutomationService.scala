package com.example.stock

import java.time.{Instant, LocalDate}

final case class StockLine(
  id: String,
  productLine: String,
  sku: String,
  description: String,
  onHand: Int,
  threshold: Int,
  reorderBuffer: Int,
  unitCost: BigDecimal,
  preferredSupplierId: String
)

final case class Counterparty(
  id: String,
  name: String,
  isCustomer: Boolean,
  isSupplier: Boolean,
  balanceDue: BigDecimal
)

final case class PurchaseOrderLine(
  sku: String,
  description: String,
  quantity: Int,
  unitCost: BigDecimal,
  lineTotal: BigDecimal
)

final case class PurchaseOrder(
  id: String,
  supplierId: String,
  createdAt: Instant,
  lines: List[PurchaseOrderLine],
  total: BigDecimal
)

final case class Invoice(
  id: String,
  counterpartyId: String,
  issuedOn: LocalDate,
  dueOn: LocalDate,
  amount: BigDecimal
)

final case class AutomationResult(
  purchaseOrders: List[PurchaseOrder],
  invoices: List[Invoice]
)

object StockAutomationService {
  private val DefaultPaymentTermsDays = 30

  def generatePurchaseOrders(lines: List[StockLine], now: Instant): List[PurchaseOrder] = {
    val orderLinesBySupplier = lines
      .filter(line => line.onHand < line.threshold)
      .groupBy(_.preferredSupplierId)
      .view
      .mapValues { supplierLines =>
        supplierLines.map { line =>
          val orderQty = Math.max(1, line.threshold + line.reorderBuffer - line.onHand)
          val lineTotal = line.unitCost * BigDecimal(orderQty)
          PurchaseOrderLine(
            sku = line.sku,
            description = line.description,
            quantity = orderQty,
            unitCost = line.unitCost,
            lineTotal = lineTotal
          )
        }.toList
      }
      .toMap

    orderLinesBySupplier.toList.zipWithIndex.map { case ((supplierId, poLines), index) =>
      val total = poLines.map(_.lineTotal).sum
      PurchaseOrder(
        id = s"PO-${index + 1}",
        supplierId = supplierId,
        createdAt = now,
        lines = poLines,
        total = total
      )
    }
  }

  def generateInvoices(counterparties: List[Counterparty], today: LocalDate): List[Invoice] = {
    counterparties
      .filter(p => p.isCustomer && p.isSupplier && p.balanceDue > 0)
      .zipWithIndex
      .map { case (party, index) =>
        Invoice(
          id = s"INV-${index + 1}",
          counterpartyId = party.id,
          issuedOn = today,
          dueOn = today.plusDays(DefaultPaymentTermsDays.toLong),
          amount = party.balanceDue
        )
      }
  }

  def runAutomation(
    stockLines: List[StockLine],
    counterparties: List[Counterparty],
    now: Instant,
    today: LocalDate
  ): AutomationResult = {
    val purchaseOrders = generatePurchaseOrders(stockLines, now)
    val invoices = generateInvoices(counterparties, today)
    AutomationResult(purchaseOrders = purchaseOrders, invoices = invoices)
  }
}
