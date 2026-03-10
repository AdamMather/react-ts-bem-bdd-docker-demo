const useDateFormatter = () => {

    const formatDate = (strDate?: string | Date | null) => {
        if (!strDate) {
            return '';
        }

        const strValue = typeof strDate === 'string' ? new Date(strDate) : strDate;
        if (!(strValue instanceof Date) || Number.isNaN(strValue.getTime())) {
            return '';
        }

        // Extracting day, month, and year
        let dd = strValue.getUTCDate();
        let mm = strValue.getUTCMonth() + 1; // Months are zero-indexed
        let yyyy = strValue.getUTCFullYear();

        // Adding leading zeros if necessary
        dd = dd < 10 ? '0' + dd : dd;
        mm = mm < 10 ? '0' + mm : mm;

        // Formatting the strDate as DD-MM-YYYY
        let formattedDate = `${yyyy}-${mm}-${dd}`;

        return formattedDate;
    };

    return { formatDate };
};

export default useDateFormatter;

