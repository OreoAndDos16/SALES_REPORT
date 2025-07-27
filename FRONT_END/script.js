function loadCustomerReport() {
    $.get('/api/customer-report', function(data) {
        let html = '<h2>Customer-wise Report</h2>';
        html += '<table><tr><th>Customer</th><th>Date</th><th>Doc No.</th><th>Amount</th></tr>';
        let currentCustomer = '';
        let subtotal = 0;
        let grandTotal = 0;

        data.forEach((row, i) => {
            if (row.cuscde !== currentCustomer && currentCustomer !== '') {
                html += `<tr><td colspan="3"><strong>${currentCustomer} Subtotal</strong></td><td><strong>${subtotal.toFixed(2)}</strong></td></tr>`;
                subtotal = 0;
            }

            html += `<tr>
                <td>${row.cuscde}</td>
                <td>${row.trndte}</td>
                <td>${row.docnum}</td>
                <td>${parseFloat(row.trntot).toFixed(2)}</td>
            </tr>`;

            subtotal += parseFloat(row.trntot);
            grandTotal += parseFloat(row.trntot);
            currentCustomer = row.cuscde;

            if (i === data.length - 1) {
                html += `<tr><td colspan="3"><strong>${currentCustomer} Subtotal</strong></td><td><strong>${subtotal.toFixed(2)}</strong></td></tr>`;
            }
        });

        html += `<tr><td colspan="3"><strong>GRAND TOTAL</strong></td><td><strong>${grandTotal.toFixed(2)}</strong></td></tr>`;
        html += '</table>';
        $('#output').html(html);
    });
}

function loadTerritoryReport() {
    $.get('/api/territory-report', function(data) {
        let html = '<h2>Territory-wise Report</h2>';
        html += '<table><tr><th>Territory</th><th>Customer</th><th>Total</th></tr>';
        let currentTerritory = '';
        let subtotal = 0;
        let grandTotal = 0;

        data.forEach((row, i) => {
            if (row.tercde !== currentTerritory && currentTerritory !== '') {
                html += `<tr><td colspan="2"><strong>${currentTerritory} Subtotal</strong></td><td><strong>${subtotal.toFixed(2)}</strong></td></tr>`;
                subtotal = 0;
            }

            html += `<tr>
                <td>${row.tercde}</td>
                <td>${row.cuscde}</td>
                <td>${parseFloat(row.total).toFixed(2)}</td>
            </tr>`;

            subtotal += parseFloat(row.total);
            grandTotal += parseFloat(row.total);
            currentTerritory = row.tercde;

            if (i === data.length - 1) {
                html += `<tr><td colspan="2"><strong>${currentTerritory} Subtotal</strong></td><td><strong>${subtotal.toFixed(2)}</strong></td></tr>`;
            }
        });

        html += `<tr><td colspan="2"><strong>GRAND TOTAL</strong></td><td><strong>${grandTotal.toFixed(2)}</strong></td></tr>`;
        html += '</table>';
        $('#output').html(html);
    });
}

function loadFillCusdsc() {
    $.get('/api/fill-cusdsc', function(data) {
        let html = '<h2>Filled Customer Descriptions</h2>';
        html += '<table><tr><th>Customer</th><th>Description</th><th>Date</th><th>Doc No.</th><th>Amount</th></tr>';
        data.forEach(row => {
            html += `<tr>
                <td>${row.cuscde}</td>
                <td>${row.cusdsc || ''}</td>
                <td>${row.trndte}</td>
                <td>${row.docnum}</td>
                <td>${parseFloat(row.trntot).toFixed(2)}</td>
            </tr>`;
        });
        html += '</table>';
        $('#output').html(html);
    });
}

function loadTrndte() {
    $.get('/api/fix-dates', function(data) {
        let html = '<h2>Fixed Transaction Dates</h2>';
        html += '<table><tr><th>recid</th><th>trndte</th><th>cremon</th><th>creyer</th><th>datetyp</th></tr>';
        data.forEach(row => {
            html += `<tr>
                <td>${row.recid}</td>
                <td>${row.trndte}</td>
                <td>${row.cremon}</td>
                <td>${row.creyer}</td>
                <td>${row.datetyp}</td>
            </tr>`;
        });
        html += '</table>';
        $('#output').html(html);
    });
}

function loadDuplicates() {
    $.get('/api/remove-duplicates', function(data) {
        if (!data || data.length === 0) {
            $('#output').html('<p>No data found after removing duplicates.</p>');
            return;
        }

        let html = '<h2>After Removing Duplicates (From "duplicatesample" Table)</h2>';
        html += '<table border="1" cellpadding="5" cellspacing="0">';
        html += '<tr><th>RecID</th><th>Field1</th><th>Field2</th><th>Field3</th></tr>';

        data.forEach(row => {
            html += `<tr>
                <td>${row.recid}</td>
                <td>${row.field1}</td>
                <td>${row.field2}</td>
                <td>${row.field3}</td>
            </tr>`;
        });

        html += '</table>';
        $('#output').html(html);
    });
}


function formatDate(excelDate) {
    if (!excelDate || isNaN(excelDate)) return '';
    const jsDate = new Date((excelDate - 25569) * 86400 * 1000);
    return jsDate.toISOString().split('T')[0]; // YYYY-MM-DD
}


function formatDate(excelDate) {
    if (!excelDate) return '';
    const jsDate = new Date((excelDate - 25569) * 86400 * 1000);
    return jsDate.toISOString().split('T')[0]; // YYYY-MM-DD
}


$(document).ready(function () {
    $('#simple-report').click(loadCustomerReport);
    $('#territory-report').click(loadTerritoryReport);
    $('#fill-cusdsc').click(loadFillCusdsc);
    $('#filter-trndte').click(loadTrndte);
    $('#remove-duplicates').click(loadDuplicates);

    // Load customer report by default (optional)
    loadCustomerReport();
});
