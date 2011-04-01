/**
 * AUTHOR: Blues
 * VERSION: 1.1 (TopCoder Cockpit - Cost Report Assembly)
 *
 * Version 1.1 change: add toggle trigger for billing cost report.
 *
 * Submits the cost report form and trigger cost report excel download.
 */
function getCostReportAsExcel() {
    $('#formDataExcel').val("true");
    document.dashboardCostReportForm.submit();
}

$(document).ready(function() {
    // initialize the multiple selection
    $('.multiselect').multiSelect();

    /** hide the filter panel **/
    hideFilter = function() {
        $('.filterArea').hide();
        $('a.fiterButton').css('background-position', 'bottom left');
    };

    /** show the filter panel **/
    showFilter = function() {
        $('.filterArea').show();
        $('a.fiterButton').css('background-position', 'top left');
    }

    // toggle the selection change for aggregation cost reports
    $('#aggregationCostReportType').change(function() {
        $('.scData').hide();
        $('.' + $(this).val() + 'AggregationCostReport').show();
    });

    /* Toggle Filter collapse/expand */
    $("a.fiterButton").click(function() {
        $(".filterContest .contestType a span").css({"width": "165px"});
        $(".filterContest .contestType div").css({"width": "188px"});
        if ($('.filterArea').css('display') == 'none') {
            showFilter();
        }
        else {
            hideFilter();
        }
    });

    /* Toggle the selection for report type */
    $("#selectReport").change(function() {
        var reportType = $(this).val();
        if (reportType == 'COST') {
            window.location.href = '/direct/dashboardCostReport';
        } else if (reportType == 'PIPELINE') {
            window.location.href = '/direct/dashboardReports';
        } else if (reportType == 'BILLING_COST') {
           window.location.href = '/direct/dashboardBillingCostReport';
        }
    });

    /* Apply button action */
    $('a.applyButton').click(function(event) {
        $('#formDataExcel').val("false");
        $('#dashboardCostReportForm').submit();
    });

    $('.dateRange a').click(function() {
        return false;
    });

    // show the filter panel by default
    $('a.fiterButton').css('background-position', 'top left');
    $('.filterArea,.container2,.tableResultFilter').show();

    function sortDropDown(dropDownId) {
        // alert('sort ' + dropDownId);
        // get the select
        var $dd = $(dropDownId);
        if ($dd.length > 0) { // make sure we found the select we were looking for

            // save the selected value
            var selectedVal = $dd.val();

            // get the options and loop through them
            var $options = $('option', $dd);
            var arrVals = [];
            $options.each(function() {
                // push each option value and text into an array
                arrVals.push({
                    val: $(this).val(),
                    text: $(this).text()
                });
            });

            // sort the array by the value (change val to text to sort by text instead)
            arrVals.sort(function(a, b) {
                if (a.val == 0) {
                    return -1;
                }
                if (b.val == 0) {
                    return 1;
                }

                if (a.text > b.text) {
                    return 1;
                }
                else if (a.text == b.text) {
                    return 0;
                }
                else {
                    return -1;
                }
            });

            // loop through the sorted array and set the text/values to the options
            for (var i = 0, l = arrVals.length; i < l; i++) {
                $($options[i]).val(arrVals[i].val).text(arrVals[i].text);
            }

            // set the selected value back
            $dd.val(selectedVal);
        }
    }

    // sort the project names
    sortDropDown("#formData\\.projectIds");
    // sort the billing accounts names
    sortDropDown("#formData\\.billingAccountIds")

    function loadOptionsByClientId(clientId) {

        $.ajax({
            type: 'POST',
            url:  "dashboardGetOptionsForClientAJAX",
            data: {'formData.customerIds':clientId},
            cache: false,
            dataType: 'json',
            success: function(jsonResult) {
                handleJsonResult(jsonResult,
                        function(result) {
                            var billings = result.billings;
                            var projects = result.projects;
                            var $billing = $("#formData\\.billingAccountIds");
                            var $project = $("#formData\\.projectIds");

                            $billing.html("");
                            $.each(billings, function(key, value) {
                                $billing.append($('<option></option>').val(key).html(value));
                            });

                            // append the default "select all"
                            $billing.append($('<option></option>').val(0).html("All Billing Accounts"));
                            $billing.val(0);

                            $project.html("");
                            $.each(projects, function(key, value) {
                                $project.append($('<option></option>').val(key).html(value));
                            });

                            // append the default "select all"
                            $project.append($('<option></option>').val(0).html("All Projects"));
                            $project.val(0);

                            sortDropDown("#formData\\.projectIds");
                            sortDropDown("#formData\\.billingAccountIds");

                        },
                        function(errorMessage) {
                            $('#validationErrors').html(errorMessage);
                        });
            }
        });
    }


    $("#formData\\.customerIds").change(function() {

        var customerId = $(this).val();

        loadOptionsByClientId(customerId);
    });

    $("#formData\\.billingAccountIds").change(function() {

        var billingId = $(this).val();

        if (billingId == 0) {
            // select all again, load all the billings and projects for customer
            var customerId = $("#formData\\.customerIds").val();

            loadOptionsByClientId(customerId);

            return;
        }

        $.ajax({
            type: 'POST',
            url:  "dashboardGetOptionsForBillingAJAX",
            data: {'formData.billingAccountIds':billingId},
            cache: false,
            dataType: 'json',
            success: function(jsonResult) {
                handleJsonResult(jsonResult,
                        function(result) {
                            var projects = result.projects;
                            var $project = $("#formData\\.projectIds");

                            $project.html("");
                            $.each(projects, function(key, value) {
                                $project.append($('<option></option>').val(key).html(value));
                            });

                            // append the default "select all"
                            $project.append($('<option></option>').val(0).html("All Projects"));
                            $project.val(0);
                            sortDropDown("#formData\\.projectIds");

                        },
                        function(errorMessage) {
                            $('#validationErrors').html(errorMessage);
                        });
            }
        });

    });
});