/*
 * Copyright (C) 2010 - 2012 TopCoder Inc., All Rights Reserved.
 */
/**
 * Contest Detail Javascript
 *
 * Version 1.1 Direct - Repost and New Version Assembly change note
 * - Add repost and new version function on details page.
 * 
 * Version 1.2 TC Direct Replatforming Release 1 change note
 * - Many changes were made to work for the new studio contest type and multiround type.
 *
 * Version 1.3 TC Direct Replatforming Release 2 change note
 * - add support to support milestone prizes for software contest.
 * - add support to switch the number of rounds when the contest is draft.
 *
 * Version 1.1.2 (TC Direct - Software Creation Update Assembly) Change notes:
 * - Update method populateTypeSection to populate copilots data.
 * 
 * Version 1.1.3 (TCCC-2926)
 * -  Add support to restrict the max characters of private description and public description.
 * 
 * Version 1.1.4 (TC Direct "Contest Links and Button" Update 24Hr Assembly)
 * - Add support to show the 'Preview Contest' link if the contest is in draft status.
 *
 * Version 1.4 TC Direct Replatforming Release 4 change note
 * - add support to save DR points for studio contest.
 *
 * Version 1.1.5 (Release Assembly - Direct Improvements Assembly Release 3)
 * - Fixes the contest fee bug in contest detail screen, load the actual contest fee from contest data rather than from config.
 *
 * Version 1.4.1 TC Direct Release 6 change note
 * - Updated retrieveContestCostWithoutAdminFee method to check for non-existing feeObject
 * 
 *  Version 1.4.2 Release Assembly - TopCoder Cockpit TinyMCE Editor Revamp changes:
 * - Updated software contest details page to use new cockpit tinyMCE editor
 * 
 * Version 1.4.3 (Release Assembly - TC Cockpit Contest Edit and Upload Update) Change notes:
 * - Fixed bug TCCC-3724. Updated logic for editing the contests.
 *
 * Version 1.4.4 (Release Assembly - TopCoder Cockpit Submission Viewer Revamp)
 * - Updated updateContestCostData method to check Studio type.
 *
 * Version 1.5 (Module Assembly - Contest Fee Based on % of Member Cost User Part)
 * - Modify contest fee calculation. If the billing is configured by percentage of member cost,
 * - the contest fee will be calculated as a percentage of the member cost.
 * - Changed methods: updateContestCostData, savePrizeSection, saveTypeSection.
 *
 * Version 1.6 (Release Assembly - TC Direct Cockpit Release Four) updates:
 * - Show start spec review when user activates the contest
 *
 * Version 1.6 (Release Assembly - TopCoder Studio CCA Integration) change notes:
 * - Add place holder support for tinyMCE editors for sutdio contest description, round1 info
 * - and round2 info fields.
 *
 * @author isv, minhu, pvmagacho, GreatKevin, TCSASSEMBER
 * @version 1.7
 */
// can edit multi round
var canEditMultiRound = true;
var contestHasSpecReview = true;

$(document).ready(function(){	

	  /* init select */
	  if($('select').length > 0){
	  	//$('.selectSoftware select,.selectDesing select,.projectSelect select,.billingSelect select,.roundelect select,.startSelect select,.milestoneSelect select,.endSelect select,.startEtSelect select,.milestoneEtSelect select,.endEtSelect select,.numSelect select, .cardSelect select, .selectMonth select, .selectYear select').sSelect(); 
	  	
	  	//$('.selectDesing div.selectedTxt').html('Select Contest Type');
	  }
	  
    /* init date-pack */
    if($('.date-pick').length > 0){
      $(".date-pick").datePicker().val(new Date().asString()).trigger('change');
    }
	  
	  
	  /* Optgroup 2 columns fix */
	  if($('.selectDesing optgroup, .selectDesign .newListOptionTitle').length > 0){
	  	var optgroupMaxHeight = 0, num;
	  	
	  	$('.selectDesing optgroup').each(function(){
	  		num = $(this).children().length + 1;
	  		optgroupMaxHeight = num * 22 > optgroupMaxHeight ? num * 22 : optgroupMaxHeight;
	  	});
	  	
	  	$('.selectDesing .newList').css('height', optgroupMaxHeight + 'px');
	  	
	  	$(window).resize(function(){$('.selectDesing .newList').css('height', optgroupMaxHeight + 'px');});
	  	$(window).scroll(function(){$('.selectDesing .newList').css('height', optgroupMaxHeight + 'px');});
	  }
		
    //contest type
		$("#editTypeButton").click(function(){			
			showTypeSectionEdit();
		});
		
		$(".save_btn").click(function(){			
			saveTypeSection();
		});
		
		$(".cancel_text").click(function(){			
			populateTypeSection();
			showTypeSectionDisplay();
		});

    //round 		
		$(".edit_round").click(function(){			
			showRoundSectionEdit();
		});
		
		$(".save_btn_round").click(function(){			
			saveRoundSection();
		});
		
		$(".cancel_text_round").click(function(){
			 populateRoundSection();
       showRoundSectionDisplay();												
		});
		
		//prize
		$(".edit_prize").click(function(){			
        showPrizeSectionEdit();			
		});
		
		$(".save_btn_prize").click(function(){			
			  savePrizeSection();									
		});
		$(".cancel_text_prize").click(function(){
            if (mainWidget.competitionType == 'SOFTWARE') {
                calcPrizes(originalPrizes[0]);
                calcDR(originalPrizes[1]);
            }
            populatePrizeSection();
            updateContestCostData();
            showPrizeSectionDisplay();
        });		
		
		//spec
		$(".edit_spec").click(function(){
			 showSpecSectionEdit();
		});
		
		$(".save_btn_spec").click(function(){
			 saveSpecSection();
		});
		$(".cancel_text_spec").click(function(){
			  populateSpecSection();
			  showSpecSectionDisplay();
		});		

		//documents/files
		$(".edit_files").click(function(){
			 setRollbackDocuments();
			 showDocumentSectionEdit();
		});
		
		$(".save_btn_files").click(function(){
			 saveDocumentSection();
		});

		$(".cancel_text_files").click(function(){
			 rollbackDocuments();
			 populateDocumentSection();
			 showDocumentSectionDisplay();
		});
       // billing projects
       $('#billingProjects').bind("change", function() {
           updateContestFee();
       });

   	//Get the contest and populate each section
   // loading some configuration data
   $.ajax({
      type: 'POST',
      url:  ctx+"/contest/detailJson",
      data: {"projectId":paramContestId},
      cache: false,
      dataType: 'json',
      async : true,
      beforeSend: function() {
        $("#contestLoading").show();
      },
      success: function (jsonResult) {
          handleJsonResult(jsonResult,
          function(result) {
            initContest(result);
            
            //render values
            populateTypeSection();
            populateRoundSection();            
            populatePrizeSection(true);
            populateSpecSection(true);
            populateDocumentSection();

              setupTinyMCEWithTemplateAndPlaceHoder('contestDescription', 10000, "Only members that register for this contest will see this description.", "studio_templates_list");
              setupTinyMCE("swPrivateDescription", 2048);
              setupTinyMCE('contestIntroduction', 2000);
              setupTinyMCEWithTemplateAndPlaceHoder('round1Info', 2000, "Only members that register for this contest will see this description.");
              setupTinyMCEWithTemplateAndPlaceHoder('round2Info', 2000, "Only members that register for this contest will see this description.");
              setupTinyMCE('swDetailedRequirements', 12000);
              setupTinyMCE('swGuidelines', 2048);
            
            //execute some actions specific for component design/dev
            //onContestTypeChange();
            $("#contestLoading").hide();
            var waitForMCE=function() {
                if (!tinyMCE.get('contestDescription')) {
                    setTimeout(waitForMCE, 500);
                    return;
                }
                updateMCEPlaceHolderCtl();
            };
            setTimeout(waitForMCE, 500);
          },
          function(errorMessage) {
              showServerError(errorMessage);
              $("#contestLoading").hide();
          })
      }
   });
   
   // round types
   $('#roundTypes').bind("change", function() {
        var roundType = $('#roundTypes').val();
        if(roundType == 'single') {
		   $('#endEditDiv .name_label').html('<strong>Round 1 Duration:</strong>');
           $('#mileStoneEditDiv').hide();
           $('#milestonePrizeDiv').hide();  	
           $('#roundInfoDiv').hide();	     
           $('#rMileStoneTR').hide();
           $('#rMultiRoundInfoDiv').hide();                 
        } else {
		   $('#endEditDiv .name_label').html('<strong>Round 2 Duration:</strong>');
           $('#mileStoneEditDiv').show();
           $('#milestonePrizeDiv').show();  	
           $('#roundInfoDiv').show();	     
           $('#rMileStoneTR').show();
           $('#rMultiRoundInfoDiv').show();                 
		   $(".milestoneEtSelect select,.numSelect select").each(function(index){
				if(!$(this).is(":hidden") && !$(this).data('customized')){
					$(this).data('customized',true);
					$(this).sSelect({ddMaxHeight: '220',yscroll: true});
				}
			}); 	
		   if (!mainWidget.softwareCompetition.multiRound) {
			   var startDate = mainWidget.softwareCompetition.assetDTO.directjsProductionDate;
			   $('#milestoneDate').datePicker().val(getDatePart(new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000))).trigger('change');
		   }
        }
   });
   $('#roundTypes').trigger("change");   
   
   // choose contest type
   $('#contestTypes').bind("change", function() {
   	   onContestTypeChange();
   });   
   
	 //technologies/categories
   $('#addTechnologies').click(function(){
       $('#masterTechnologiesSelect option:selected').appendTo('#masterTechnologiesChoosenSelect');
       sortTechnologySelects();   	 
   });
   
   $('#removeTechnologies').click(function(){
       $('#masterTechnologiesChoosenSelect option:selected').appendTo('#masterTechnologiesSelect');   	 
       sortTechnologySelects();
   });
   
   $('#catalogSelect').bind("change", function() {
   	   updateCategories();
   });
   
   
   $('#addCategories').click(function(){
       $('#select1_categories option:selected').appendTo('#select2_categories');
       sortCategorySelects();   	 
   });
   
   $('#removeCategories').click(function(){
       $('#select2_categories option:selected').appendTo('#select1_categories');   	 
       sortCategorySelects();
   });        			      	
   
   // prizes
   $('input[name="prizeRadio"]').click(function(){
      var billingProjectId = $('select#billingProjects').val();
   	  fillPrizes(billingProjectId);
   });
   
   $('#swFirstPlace').bind('keyup',function() {
       onFirstPlaceChangeKeyUp();
    });
    
    $('#swDigitalRun').bind('keyup',function() {
       onDigitalRunChangeKeyUp();
    });
	
   
   $('#ContestDescriptionHelpIcon .helpIcon').hover(function(){
	   showPopup(this,'contestDescriptionToolTip');
   },function(){
	   $('#contestDescriptionToolTip').hide();
   });
	  
   $('#Round1HelpIcon .helpIcon').hover(function(){
	   showPopup(this,'contestRound1ToolTip');
   },function(){
	   $('#contestRound1ToolTip').hide();
   });
	  
   $('#Round2HelpIcon .helpIcon').hover(function(){
	    showPopup(this,'contestRound2ToolTip');
   },function(){
	   $('#contestRound2ToolTip').hide();
   });
});

var ACTIVE_PROJECT_STATUS = 1;
var isActiveContest = false;
var startedContest = true;
var preCost = 0;

/**
 * event handler function when contest type is changed.
 */
function onContestTypeChange() {
   	  var contestType = getContestType(true)[0];
   	  var typeId = getContestType(true)[1];   	  
   	  var currentTypeId = -1;
   	  if(isContestSaved()) {
   	  	 currentTypeId = mainWidget.softwareCompetition.projectHeader.projectCategory.id;
   	  }   	  
 
   	  if(isContestSaved() && mainWidget.competitionType != contestType) {   	  	
   	  	   showErrors("You can not switch between studio and software after it is saved.");
   	  	 
   	  	   return;
   	  }
   	  
   	  mainWidget.competitionType = contestType;
   	     	  
   	  if(isDevOrDesign()) {
   	  	 $('.component').show();
   	  } else {
   	  	 $('.component').hide();
   	  }

   	  if(typeId == currentTypeId) {
   	  	 // it is a revert, nothing to do here
   	  	 return;
   	  }
}

/**
 * Fix the id in mainWidget.softwareCompetition.fileTypes.
 * @since 1.7
 */
function fixFileTypeIds() {
    var types = getSplitFileTypes(mainWidget.softwareCompetition.fileTypes);
    var fileTypes = [];
    for (var i = 0; i < types[0].length; i++) {
        fileTypes.push(types[0][i].value);
    }
    for (var i = 0; i < types[1].length; i++) {
        fileTypes.push(types[1][i]);
    }
    mainWidget.softwareCompetition.fileTypes = fileTypes;
}

function initContest(contestJson) {
   if (!contestJson.projectStudioSpecification) {
      mainWidget.competitionType = 'SOFTWARE';
      delete mainWidget.softwareCompetition.projectHeader.projectStudioSpecification;
   } else {
	  mainWidget.competitionType = 'STUDIO';
	  mainWidget.softwareCompetition.projectHeader.projectStudioSpecification = contestJson.projectStudioSpecification;
	  var fileTypes = [];
	  var types = contestJson.fileTypes;
	  if (types) {
		  for (var i = 0; i < types.length; i++) {
			  fileTypes.push(types[i].description);
		  }
	  }
	  mainWidget.softwareCompetition.fileTypes = fileTypes;
	  delete mainWidget.softwareCompetition.projectHeader.projectStudioSpecification.creationTimestamp;
	  delete mainWidget.softwareCompetition.projectHeader.projectStudioSpecification.creationUser;
	  delete mainWidget.softwareCompetition.projectHeader.projectStudioSpecification.modificationTimestamp;
	  delete mainWidget.softwareCompetition.projectHeader.projectStudioSpecification.modificationUser;
   }
    
    var isStudio = mainWidget.competitionType == 'STUDIO';
	  //general initialization
	      // populate the select option for software group
    $.each(projectCategoryArray,function(i, projectCategory) {
    	// not show copilot contest type
        if (projectCategory.id != 29 && projectCategory.typeId != 3 && !isStudio) {
            if ($("optgroup[label='Software']").length > 0) {
                $("<option/>").val("SOFTWARE"+projectCategory.id).text(projectCategory.label).appendTo("optgroup[label='Software']");
            } else {
                $("<option/>").val("SOFTWARE"+projectCategory.id).text(projectCategory.label).appendTo("#contestTypes");
            }
//            $("<option/>").val("SOFTWARE"+projectCategory.id).text(projectCategory.label).appendTo("optgroup[label='Software']");
        }
        if (projectCategory.typeId == 3 && isStudio) {
        	if ($("optgroup[label='Studio']").length > 0) {
        		$("<option/>").val("STUDIO"+projectCategory.id).text(projectCategory.label).appendTo("optgroup[label='Studio']");
        	} else {
        		$("<option/>").val("STUDIO"+projectCategory.id).text(projectCategory.label).appendTo("#contestTypes");
        	}
        }
    });
    

   //contest data
   mainWidget.softwareCompetition.multiRound = contestJson.hasMulti;
   if (contestJson.hasMulti) {
	   mainWidget.softwareCompetition.milestoneDate = parseDate(contestJson.multiRoundEndDate);
   }
   mainWidget.softwareCompetition.projectHeader.id = contestJson.contestId;
   mainWidget.softwareCompetition.projectHeader.projectCategory= contestJson.projectCategory;
   mainWidget.softwareCompetition.projectHeader.projectStatus = contestJson.projectStatus;
   mainWidget.softwareCompetition.assetDTO.name = contestJson.contestName;
   mainWidget.softwareCompetition.endDate = parseDate(contestJson.endDate);
   mainWidget.softwareCompetition.paidFee = contestJson.paidFee;
   mainWidget.softwareCompetition.adminFee = contestJson.adminFee;

   var startDate =  parseDate(contestJson.startDate);  
   mainWidget.softwareCompetition.assetDTO.directjsProductionDate = startDate;
   mainWidget.softwareCompetition.assetDTO.productionDate = formatDateForRequest(startDate);
   mainWidget.softwareCompetition.subEndDate = parseDate(contestJson.subEndDate);

    $('#contestTypeNameText').html(getProjectCategoryById(mainWidget.softwareCompetition.projectHeader.projectCategory.id).name);
    

    // copilots
    var copilots = contestJson.copilots; // get copilots data from result
    var hasCopilot = false;

    $.each(copilots, function(k, v){
        mainWidget.softwareCompetition.copilotUserId = k;
        mainWidget.softwareCompetition.copilotUserName = v;
        hasCopilot = true;
    });

    mainWidget.softwareCompetition.copilotCost = parseFloat(contestJson.copilotsFee);

   if(isDevOrDesign()) {
     mainWidget.softwareCompetition.assetDTO.directjsRootCategoryId = contestJson.rootCategoryId;
     mainWidget.softwareCompetition.assetDTO.directjsCategories = contestJson.categoryIds;
   }
   
   if(isTechnologyContest()) {
     mainWidget.softwareCompetition.assetDTO.directjsTechnologies = contestJson.technologyIds;
   }
   
   var projectHeader = mainWidget.softwareCompetition.projectHeader;   
   projectHeader.tcDirectProjectId = contestJson.tcDirectProjectId;
   projectHeader.tcDirectProjectName = contestJson.tcDirectProjectName;
   projectHeader.setBillingProject(contestJson.billingProjectId);   
   projectHeader.setProjectName(contestJson.contestName);
   projectHeader.properties = contestJson.properties;
      
   projectHeader.projectSpec.detailedRequirements = contestJson.detailedRequirements;
   projectHeader.projectSpec.finalSubmissionGuidelines = contestJson.softwareGuidelines;
   projectHeader.projectSpec.privateDescription = contestJson.privateDescription;
   projectHeader.prizes = contestJson.prizes;
   if (projectHeader.prizes) {
	   for (var i = 0; i < projectHeader.prizes.length; i++) {
		   delete projectHeader.prizes[i].creationTimestamp;
		   delete projectHeader.prizes[i].creationUser;
		   delete projectHeader.prizes[i].modificationTimestamp;
		   delete projectHeader.prizes[i].modificationUser;
	   }
   }
   
   //prizes: if custom level, initiate customCosts object so it is not derived from custom level any more   
   if(projectHeader.getCostLevel() == COST_LEVEL_CUSTOM) {
   	    customCosts = {};
        customCosts.firstPlaceCost = parseFloat(projectHeader.getFirstPlaceCost());
        customCosts.secondPlaceCost = parseFloat(projectHeader.getSecondPlaceCost());
        customCosts.reviewBoardCost = parseFloat(projectHeader.getReviewCost());
        customCosts.reliabilityBonusCost = parseFloat(projectHeader.getReliabilityBonusCost());
        customCosts.drCost = parseFloat(projectHeader.getDRPoints());   	   
   }
   
   
   //documentations, each doc has fields of documentId, fileName, description, documentTypId, url
   swDocuments = contestJson.documentation;
   // mark them as documentation
   $.each(swDocuments, function(i, doc) {
   	  doc['comp'] = true;
   });      
   setRollbackDocuments();

   //it ensures the data is here so we could show prize data
   softwareContestFees = contestJson.softwareContestFees;  
   //billing information
   initContestFeeForEdit(false, mainWidget.softwareCompetition.projectHeader.projectCategory.id, projectHeader.getBillingProject());      

    // Check if the prizes were updated manually in Online Review, if so then treat this as custom
    // prize schema
    var customPrizesUsed = false;
    if (projectHeader.getCostLevel() != COST_LEVEL_CUSTOM) {
        var prize1 = parseFloat(projectHeader.getFirstPlaceCost());
        var prize2 = parseFloat(projectHeader.getSecondPlaceCost());
        var reviewCost = parseFloat(projectHeader.getReviewCost());
        var reliabilityBonusCost = parseFloat(projectHeader.getReliabilityBonusCost());
        var drPointsCost = parseFloat(projectHeader.getDRPoints());

        // Iterate over billing schemas and try to find which matches the prizes exacly
        // If no such schema found then this indicates that the prizes were updated in O/R
        // manually and treat this as custom schema
        var index;
        if (projectHeader.getCostLevel() == 'A') {
            index = 0;
        }
        if (projectHeader.getCostLevel() == 'B') {
            index = 1;
        } else {
            index = 2;
        }
        var feesConfig = softwareContestFees[mainWidget.softwareCompetition.projectHeader.projectCategory.id + ''];
        if (feesConfig) {
            var c = feesConfig.contestCost.contestCostBillingLevels[index];
            if (c) {
                var s_prize1 = c.firstPlaceCost;
                var s_prize2 = c.secondPlaceCost;
                var s_reviewCost = c.reviewBoardCost;
                var s_reliabilityBonusCost = c.reliabilityBonusCost;
                var s_drPointsCost = c.drCost;

                if ((prize1 != s_prize1) || (prize2 != s_prize2) || (reviewCost != s_reviewCost)
                        || (reliabilityBonusCost != s_reliabilityBonusCost) || (drPointsCost != s_drPointsCost)) {
                    customPrizesUsed = true;
                }
            }
        }
        if (customPrizesUsed) {
            customCosts = {};
            customCosts.firstPlaceCost = prize1;
            customCosts.secondPlaceCost = prize2;
            customCosts.reviewBoardCost = reviewCost;
            customCosts.reliabilityBonusCost = reliabilityBonusCost;
            customCosts.drCost = drPointsCost;
            mainWidget.softwareCompetition.projectHeader.setCostLevel(COST_LEVEL_CUSTOM);
        }
    }



	 if(isPrizeEditable(contestJson.billingProjectId) || projectHeader.getCostLevel() == COST_LEVEL_CUSTOM
             || customPrizesUsed) {
	 	  $('.customRadio').show();
	 } else {
	 	  $('.customRadio').hide();
	 }	     
	 
	 //it show/hide the component specific part
   if(isDevOrDesign()) {
   	 $('.component').show();
   } else {
   	 $('.component').hide();
   }

   if(isTechnologyContest()) {
   	 $('.technology').show();
   } else {
     $('.technology').hide();
   }      
   
   // preview contest, repost and new version
   var statusName = contestJson.projectStatus.name;    
    if(statusName.indexOf('Draft') != -1) {
         $('#previewContestButton').show();
    } else {
         $('#viewContestButton').show();
    }
   if(statusName.indexOf('Cancelled') != -1) {
    	 repostProjectId = contestJson.contestId;
	     repostTcProjectId = contestJson.tcDirectProjectId;
   	  
   	  $('#repostButton').show();
      $('#repostButtonSplitter').show();
   	  $('#repostButton').click(function(){
   	      $('#repostDialog').dialog('open');	 
   	  });
   }

   if(statusName.indexOf('Completed') != -1) {
	     newVersionProjectId = contestJson.contestId;
	     newVersionTcProjectId = contestJson.tcDirectProjectId;
	     newVersionDevCreation = isDesign();
	     newVersionIsDesign = isDesign();
	     newVersionMinorVersion = false;
   	  
   	  $('#newVersionButton').show();
      $('#newVersionButtonSplitter').show();
   	  $('#newVersionButton').click(function(){
   	      $('#newVersionDialog').dialog('open');	 
   	  });
   }
   
    phaseOpen = contestJson.phaseOpen;
    isCompleted = contestJson.projectStatus.id == 7;
    isCancelled = (contestJson.projectStatus.id > 3) && !isCompleted;
    
    // if has no write permission, no edit; if any phase is open, no edit
    $('#contestNameText').hide();
    if (!hasContestWritePermission) {
        $('a.button11').hide();
        $("#resubmit").hide();
        $(".activateButton").hide();
        $("#swEdit_bottom_review").hide();
    } else if(isCompleted || isCancelled) {
        $('a.button11').hide();
        $('a.editType').show();
        $('#chkboxCCA').attr("disabled", true);
        $('#contestName').hide();
        $('#contestNameText').show();
        $('#copilots').attr("disabled", true);
        $('.copilotsSelect').html('');
        if (mainWidget.softwareCompetition.copilotUserId <=0) {
             $(".copilotsSelect").html("Unassigned");
        } else {
             $(".copilotsSelect").html(mainWidget.softwareCompetition.copilotUserName);
        }
        $('.detailsContent_det_type_edit span.name3').html(mainWidget.softwareCompetition.projectHeader.isLccchecked() ? "CCA is Required" : "CCA is Not Required")
        
        $('#contestTypes').attr("disabled", true);
        $('.contestTypeRO').show();
        $('.contestTypeEditSection').hide();
        
    } else if(phaseOpen) {
        $('a.button11').hide();
        $('a.editType').show();
        $('#chkboxCCA').attr("disabled", true);
//        $('#contestName').hide();
//        $('#contestNameText').show();
        $('#copilots').attr("disabled", true);
        $('.copilotsSelect').html('');
        if (mainWidget.softwareCompetition.copilotUserId <=0) {
             $(".copilotsSelect").html("Unassigned");
        } else {
             $(".copilotsSelect").html(mainWidget.softwareCompetition.copilotUserName);
        }
        $('.detailsContent_det_type_edit span.name3').html(mainWidget.softwareCompetition.projectHeader.isLccchecked() ? "CCA is Required" : "CCA is Not Required")
        
        $('#contestTypes').attr("disabled", true);
        $('.contestTypeRO').show();
        $('.contestTypeEditSection').hide();
        
        // open prize edit section if project is active
        if (contestJson.projectStatus != null && contestJson.projectStatus.name == DRAFT_STATUS) {
            isActiveContest = true;
            $(".edit_prize").parent().show();
        } else {
            $(".edit_prize").show();
            $(".edit_round").show();
            $('#roundEdit').hide();
            $('#roundText').show();
        }
        
        $(".edit_spec").show();
        $(".edit_files").show();
    } else {
        $('.contestTypeEditSection').show();
    }    

    showSpecReview(contestJson);
    
    // can't change the multi round type if conetst is not draft 
    if (contestJson.projectStatus.name != "Draft") {
    	canEditMultiRound = false;
    }
}


/**
 * Retrieve contest cost without admin fee.
 */
function retrieveContestCostWithoutAdminFee() {
    var prizeType = $('input[name="prizeRadio"]:checked').val();
    var projectCategoryId = mainWidget.softwareCompetition.projectHeader.projectCategory.id + "";
    var feeObject = softwareContestFees[projectCategoryId];
    
    if(!feeObject) {
         return 0;
    }
    return getContestTotal(feeObject, prizeType) - mainWidget.softwareCompetition.adminFee;
}

/**
 * Type Section Functions
 */
function populateTypeSection() {
        var p = mainWidget.softwareCompetition.projectHeader.properties;
        var contestPercentage = parseFloat(p['Contest Fee Percentage']);
		var adminFee = parseFloat(p['Admin Fee']);

	//edit
	$('#contestTypes').getSetSSValue(mainWidget.competitionType+mainWidget.softwareCompetition.projectHeader.projectCategory.id);
	$('#contestName').val(mainWidget.softwareCompetition.assetDTO.name);
	$('#contestNameText').html(mainWidget.softwareCompetition.assetDTO.name);
	$('#chkboxCCA').attr('checked', mainWidget.softwareCompetition.projectHeader.isLccchecked());
	
	//display
	$('#rContestTypeName').html($("#contestTypes option[value=" + mainWidget.competitionType + mainWidget.softwareCompetition.projectHeader.projectCategory.id +"]").text());
	$('#rContestName').html(mainWidget.softwareCompetition.assetDTO.name);
	$('#rCCA').html(mainWidget.softwareCompetition.projectHeader.isLccchecked() ? "Required" : "Not Required");
	if (mainWidget.softwareCompetition.projectHeader.tcDirectProjectName != null) {
		$('#rProjectName').html(mainWidget.softwareCompetition.projectHeader.tcDirectProjectName);
	}
	//$('#rAdminFee').html(parseFloat(mainWidget.softwareCompetition.adminFee).formatMoney(2));
  
  if (mainWidget.softwareCompetition.copilotUserId <=0) {
  	 $("#rCopilots").html("Unassigned");
  } else {
  	 $("#rCopilots").html('<a href=https://www.topcoder.com/tc?module=MemberProfile&cr=' + mainWidget.softwareCompetition.copilotUserId + '>' + mainWidget.softwareCompetition.copilotUserName + '</a>');
  }

    // set copilot selection value in edit mode
       $("#copilots").val(mainWidget.softwareCompetition.copilotUserId);

  //billing account
  var billingProjectId = mainWidget.softwareCompetition.projectHeader.getBillingProject();
  $('#billingProjects').getSetSSValue(billingProjectId);
  if (contestPercentage!= null && contestPercentage > 0) {  
      $('#rAdminFee').html(parseFloat(adminFee).formatMoney(2) + ' (' + contestPercentage * 100 + '% markup)');
  } else {
      $('#rAdminFee').html(parseFloat(adminFee).formatMoney(2));
  }
  //potential rollback
	$('#billingProjects').trigger("change");
	if(isBillingEditable()) {
		$('#billingAccountDivEdit').show();
  } else {
  	$('#billingAccountDivEdit').hide();
  }

  if(isBillingViewable()) {
     $('.billingdisplay').show();
     $('#rBillingAccount').html((billingProjectId <= 0)?"&nbsp;":$("#billingProjects option[value="+ billingProjectId +"]").text());
  } else {
  	 $('.billingdisplay').hide();
  }
}

/**
 * Update the tinyMCE editors to support or not support the placeholder function.
 * @since 1.7
 */
function updateMCEPlaceHolderCtl() {
    if (mainWidget.softwareCompetition.projectHeader.isLccchecked()) {
        enableMCEPlaceholderText = true;
        $(['contestDescription', 'round1Info', 'round2Info']).each(function() {
            var obj = tinyMCE.get(this);
            if (obj.getContent() == "") {
                obj.setContent("Only members that register for this contest will see this description.");
            }
       });
     } else {
        $(['contestDescription', 'round1Info', 'round2Info']).each(function() {
            var obj = tinyMCE.get(this);
            if (obj.getContent() == "") {
                obj.setContent("");
            }
       });
       enableMCEPlaceholderText = false;
     }
}

function saveTypeSection() {
   if(!validateFieldsTypeSection()) {
       return;
   }
   if (mainWidget.competitionType != "SOFTWARE") {
      if (mainWidget.softwareCompetition.projectHeader.isLccchecked()) {
        $("#viewableSubmFlag").attr("disabled","disabled");
        $("#viewableSubmFlag").attr("checked","");
        mainWidget.softwareCompetition.projectHeader.properties['Viewable Submissions Flag'] = 'false';
      } else {
        $("#viewableSubmFlag").attr("disabled","");
      }
      populateSpecSection();
   }

   //construct request data
   fixFileTypeIds();
   var request = saveAsDraftRequest();

   $.ajax({
      type: 'POST',
      url: ctx + "/launch/saveDraftContest",
      data: request,
      cache: false,
      dataType: 'json',
      success: function(jsonResult) {
         handleSaveAsDraftContestResult(jsonResult);
         populateTypeSection();  
	 populateRoundSection(); 
         if (mainWidget.competitionType == "SOFTWARE") {
            var billingProjectId = mainWidget.softwareCompetition.projectHeader.getBillingProject();
            if (billingFeesPercentage[billingProjectId]!= null && billingFeesPercentage[billingProjectId].contestFeePercentage!=null) {
                populatePrizeSection();
            }
         }
         showTypeSectionDisplay();
         updateMCEPlaceHolderCtl();
      },
      beforeSend: beforeAjax,
      complete: afterAjax            
   });	 
}

function validateFieldsTypeSection() {
   var categoryId = getContestType(true)[1];
   var contestName = $('input#contestName').val();
   var tcProjectId = parseInt($('select#projects').val());
   var copilotUserId = parseInt($('select#copilots').val());
   var copilotName = $('select#copilots option:selected').text();

   //validation
   var errors = [];

   validateContestName(contestName, errors);
   validateTcProject(tcProjectId, errors);
   if(errors.length > 0) {
       showErrors(errors);
       return false;
   }
   
   var projectCategory = getProjectCategoryById(categoryId);
   if ($('input#chkboxCCA').attr('checked')) {
       mainWidget.softwareCompetition.projectHeader.setConfidentialityTypePrivate();
   } else {
       mainWidget.softwareCompetition.projectHeader.setConfidentialityTypePublic();
   }
   mainWidget.softwareCompetition.projectHeader.projectCategory={};
   mainWidget.softwareCompetition.projectHeader.projectCategory.id = projectCategory.id;
   mainWidget.softwareCompetition.projectHeader.projectCategory.name = projectCategory.name;
   mainWidget.softwareCompetition.projectHeader.projectCategory.projectType={};
   mainWidget.softwareCompetition.projectHeader.projectCategory.projectType.id = projectCategory.typeId;
   mainWidget.softwareCompetition.projectHeader.projectCategory.projectType.name = projectCategory.typeName;
         
   mainWidget.softwareCompetition.assetDTO.name = contestName;         
   mainWidget.softwareCompetition.projectHeader.setProjectName(contestName);

   // set the copilot user id and user name
   mainWidget.softwareCompetition.copilotUserId = copilotUserId;
   mainWidget.softwareCompetition.copilotUserName = copilotName;
   
   mainWidget.softwareCompetition.projectHeader.tcDirectProjectId = tcProjectId;
   mainWidget.softwareCompetition.projectHeader.tcDirectProjectName = $('select#projects option[value=' + tcProjectId + ']').html()
   
   if (!hasMultiRound(mainWidget.softwareCompetition.projectHeader.projectCategory.id)) {
	   mainWidget.softwareCompetition.multiRound = false;
   }

   if(isBillingEditable()) {
       var billingProjectId = $('select#billingProjects').val();
       mainWidget.softwareCompetition.projectHeader.setBillingProject(billingProjectId);
   }

   return true;	
}

function showTypeSectionDisplay() {
	 $(".contest_type").css("display","block");
	 $(".contest_type_edit").css("display","none");												         	
}

function showTypeSectionEdit() {
	 $(".contest_type").css("display","none");
	 $(".contest_type_edit").css("display","block");
	 if(!$(".selectDesing select").data('customized')){
		$(".selectDesing select").data('customized',true);
      	$(".selectDesing select").sSelect();
		$('.selectDesing div.selectedTxt').html('Select Contest Type');
    }

    if(!$('#projects').data('customized')) {
        $('#projects').sSelect({ddMaxHeight: '220',yscroll: true}).change(function() {
              handleProjectDropDownChange();
          });
        $('#projects').data('customized',true);
    }
    
    if(!$('#billingProjects').data('customized')) {
        $('#billingProjects').sSelect({ddMaxHeight: '220',yscroll: true}).change(function() {
              handleProjectDropDownChange();
          });
        $('#billingProjects').data('customized',true);
    }

    if(!$('#copilots').data('customized')) {
       $('#copilots').sSelect({ddMaxHeight: '220',yscroll: true});
       $('#copilots').data('customized',true);
    }
	 $('#contestTypes').getSetSSValue(mainWidget.competitionType+mainWidget.softwareCompetition.projectHeader.projectCategory.id);
    
    var projectType = mainWidget.competitionType;
    var projectCategoryId = mainWidget.softwareCompetition.projectHeader.projectCategory.id;
}

/**
 * Gets the milstone prizes as array. The first element is the prize for each winner, the second element is
 * the number of the milestone submissions.
 */
function getMilestonePrizes() {
	var prizes = mainWidget.softwareCompetition.projectHeader.prizes;
	for (var i = 0; i < prizes.length; i++) {
		if (prizes[i].prizeType.id == MILESTONE_PRIZE_TYPE_ID) {
			return [prizes[i].prizeAmount, prizes[i].numberOfSubmissions];
		}
	}
	return [0, 0];
}

function getDurationDayHour(start, end) {
	var t = end.getTime() - start.getTime() + 5 * 60 * 1000; // add 5 mintues due to diff between reg and sub
	t = parseInt(t / 1000 / 60 / 60);
	return [parseInt(t / 24), t % 24];
}

/**
 * Round/Schedule Section Functions
 */
function populateRoundSection() {
	var startDate = mainWidget.softwareCompetition.assetDTO.directjsProductionDate;
	var endDate = mainWidget.softwareCompetition.endDate;
	var subEndDate = mainWidget.softwareCompetition.subEndDate;
	var isMultiRound = mainWidget.softwareCompetition.multiRound;
	var subDuration = getDurationDayHour(startDate, subEndDate);
	if (isMultiRound) {
		var milestoneDate = mainWidget.softwareCompetition.milestoneDate;
		var milestonePrizes = getMilestonePrizes();
		var milestoneDuration = getDurationDayHour(startDate, milestoneDate);
		subDuration = getDurationDayHour(milestoneDate, subEndDate);
	}
	
	//edit
	$('#roundTypes').val(isMultiRound?'multi':'single');
	$('#roundTypes').trigger("change");    
	$('#startDate').datePicker().val(getDatePart(startDate)).trigger('change');
	$('#startTime').val(getRoundedTime(startDate));
	$('#endDateDay').val(subDuration[0]).trigger('change');
	$('#endDateHour').val(subDuration[1]).trigger('change');
	if (!hasMultiRound(mainWidget.softwareCompetition.projectHeader.projectCategory.id) || !canEditMultiRound) {
		$('#type').hide();
   	} else {
		$('#type').show();
	}
	if(!isMultiRound) {	
		$('#mileStoneEditDiv').hide();  		     
	      
	    $('#milestonePrizeDiv').hide();  	
	    $('#roundInfoDiv').hide();	     
	} else {
		$('#mileStoneEditDiv').show();  	
		$('#milestoneDateDay').val(milestoneDuration[0]).trigger('change');
		$('#milestoneDateHour').val(milestoneDuration[1]).trigger('change');
		 	  
		$('#milestonePrizeDiv').show();
		$('#milestonePrize, #swMilestonePrize').val(milestonePrizes[0]);
		$('#milestoneSubmissionNumber, #swMilestoneSubmissionNumber').val(milestonePrizes[1]).trigger('change');
		 	  
		$('#roundInfoDiv').show();	     
		if (mainWidget.competitionType == "STUDIO") {
			$('#round1Info').val(mainWidget.softwareCompetition.projectHeader.projectStudioSpecification.roundOneIntroduction);
			$('#round2Info').val(mainWidget.softwareCompetition.projectHeader.projectStudioSpecification.roundTwoIntroduction);
		}
	}
		
	//display
    var startDateString = formatDateForReview(startDate);
    $('#rStartDate').html(startDateString);
    $('#rStartDateRO').html(startDateString);
    $('table.projectStats td:eq(0)').html(startDateString);
    var endDateString = formatDateForReview(endDate);
    $('#rEndDate').html(endDateString);
    $('#rEndDateRO').html(endDateString);
    $('table.projectStats td:eq(1)').html(endDateString);
	$('#rSubEndDate').html(formatDateForReview(subEndDate));
	$('#rSubEndDateRO').html(formatDateForReview(subEndDate));
   
    if(!isMultiRound) {	
    	$('#rMileStoneTR').hide();
        $('#rMultiRoundInfoDiv').hide();      
  	} else {
  		$('#rMileStoneTR').show();  	
  	 	$('#rMilestoneDate').html(formatDateForReview(milestoneDate));
  	 	$('#rMilestoneDateRO').html(formatDateForReview(milestoneDate));
  	 	  	 	  
        $('#rMultiRoundInfoDiv').show();
        $('#rMPrizesAmount').text('$'+milestonePrizes[0].formatMoney(2));
        $('#rMPrizesNumberOfSubmissions').html(milestonePrizes[1]);
        if (mainWidget.competitionType == "STUDIO") {
        	$('#rRound1Info').html(mainWidget.softwareCompetition.projectHeader.projectStudioSpecification.roundOneIntroduction);
        	$('#rRound2Info').html(mainWidget.softwareCompetition.projectHeader.projectStudioSpecification.roundTwoIntroduction);
        }
  	}
}

function saveRoundSection() {
   var preStartDate = mainWidget.softwareCompetition.assetDTO.directjsProductionDate;
   var preSubEndDate = mainWidget.softwareCompetition.subEndDate;
   var preMilestoneDate = mainWidget.softwareCompetition.milestoneDate;
   if(!validateFieldsRoundSection()) {
       return;
   }

   //construct request data
   fixFileTypeIds();
   var request = saveAsDraftRequest();

   $.ajax({
      type: 'POST',
      url: ctx + "/launch/saveDraftContest",
      data: request,
      cache: false,
      dataType: 'json',
      success: function(jsonResult) {
         handleSaveAsDraftContestResult(jsonResult);
		 if (jsonResult.error) {
			 mainWidget.softwareCompetition.assetDTO.directjsProductionDate = preStartDate;
			 mainWidget.softwareCompetition.subEndDate = preSubEndDate;
			 mainWidget.softwareCompetition.milestoneDate = preMilestoneDate;
		 }
         populateRoundSection();  
         populatePrizeSection();
         showRoundSectionDisplay();                  
      },
      beforeSend: beforeAjax,
      complete: afterAjax            
   });	    
}

/**
 * Gets the index of milestone type prize from a list of prizes.
 * 
 * @param prizes the list of prizes
 * @returns {Number} the index of milestone type prize
 */
function getMilestonePrize(prizes) {
	for (var i = 0; i < prizes.length; i++) {
		if (prizes[i].prizeType.id == MILESTONE_PRIZE_TYPE_ID) {
			return i;
		}
	}
	return -1;
}

/**
 * Gets the content of a TinyMCE.
 * 
 * @param id the id of TinyMCE
 * @returns the content of the TinyMCE
 */
function getTinyMCEContent(id) {
	var obj = tinyMCE.get(id);
	if (!obj) {
		return "";
	}
	return obj.getContent();
}

function validateFieldsRoundSection() {
	var isMultiRound = ('multi' == $('#roundTypes').val());
	var startDate = getDateByIdPrefix('start');
	var milestoneDateHours = $('#milestoneDateDay').val() * 24 + parseInt($('#milestoneDateHour').val());

	var round1Info = getTinyMCEContent('round1Info'); 
	var round2Info = getTinyMCEContent('round2Info');
	//milestone prize
	var milestonePrizeInput;
   
	//validation
	var errors = [];

    if (startDate < getServerTime()) {
        // errors.push('Start Date must be in future.');
    }
    if (isMultiRound && milestoneDateHours == 0) {
		if (mainWidget.competitionType == "STUDIO") {
			errors.push('Round 1 duration should be positive.');
		} else {
			errors.push('Milestone duration must be positive.');
		}
    }
	if (mainWidget.competitionType == "STUDIO") {
		var subEndDateHours = $('#endDateDay').val() * 24 + parseInt($('#endDateHour').val());
		if (subEndDateHours == 0) {
		   if (isMultiRound) {
			   errors.push('Round 2 duration should be positive.');
		   } else {
			   errors.push('Round 1 duration should be positive.');
		   }
		}
	}

	var milestonePrize;
	if(isMultiRound) {
		if (mainWidget.competitionType == "STUDIO") {
			milestonePrizeInput = $('#milestonePrize').val();
		} else {
			milestonePrizeInput = $('#swMilestonePrize').val();
		}
		milestonePrize = parseFloat(milestonePrizeInput);
		if(!checkRequired(milestonePrizeInput) || !checkNumber(milestonePrizeInput) || isNaN(milestonePrize)) {
			errors.push('Milestone prize is invalid.');
		} else {
            // If registration is already started then check that the milestone prize is not decreased
            if (phaseOpen) {
                if (milestonePrize < getMilestonePrizes()[0]){
                    errors.push('The milestone prize can not be decreased');
                }
            }
        }
	       
		if (mainWidget.competitionType == "STUDIO") {
			if(!checkRequired(round1Info)) {
				errors.push('Round 1 information is empty.');
			}
	      
			if(!checkRequired(round2Info)) {
				errors.push('Round 2 information is empty.');
			}
			
			// set milestone prizes
			var find = false;
			var prizes = mainWidget.softwareCompetition.projectHeader.prizes;
			if (!prizes) {
				prizes = [];
			}
			var newPrizes = [];
			for (var i = 0; i < prizes.length; i++) {
				newPrizes.push(new com.topcoder.direct.Prize(prizes[i].place, prizes[i].prizeAmount, prizes[i].prizeType.id, prizes[i].numberOfSubmissions));
			}
			prizes = newPrizes;
			var ind = getMilestonePrize(prizes);
			if (ind == -1) {
				prizes.push(new com.topcoder.direct.Prize(1, milestonePrize, MILESTONE_PRIZE_TYPE_ID, parseInt($('#milestoneSubmissionNumber').val())));
			} else {
				prizes[ind].prizeAmount = milestonePrize;
				prizes[ind].numberOfSubmissions = parseInt($('#milestoneSubmissionNumber').val());
			}
		}
	} else if (mainWidget.competitionType == "STUDIO") {
		// remove the milestone prize
		var prizes = mainWidget.softwareCompetition.projectHeader.prizes;
		var newPrizes = [];
		for (var i = 0; i < prizes.length; i++) {
			if (prizes[i].prizeType.id != MILESTONE_PRIZE_TYPE_ID) {
				newPrizes.push(prizes[i]);
			}
		}
		prizes = newPrizes;
		milestoneDateHours = 0;
	}

	// check total payment
	/**if(getCurrentContestTotal(true) < mainWidget.softwareCompetition.paidFee) {
		errors.push('Your payment can not be lower than paid amount.');
	}*/
	
   if(errors.length > 0) {
       showErrors(errors);
       return false;
   }

   mainWidget.softwareCompetition.multiRound = isMultiRound;
   mainWidget.softwareCompetition.assetDTO.directjsProductionDate = startDate;
   mainWidget.softwareCompetition.assetDTO.productionDate = formatDateForRequest(startDate);
   mainWidget.softwareCompetition.startDate = startDate;
   mainWidget.softwareCompetition.milestoneDate = new Date();
   mainWidget.softwareCompetition.milestoneDate.setTime(startDate.getTime() + milestoneDateHours * 60 * 60 * 1000);

   if (mainWidget.competitionType == "STUDIO") {
	   mainWidget.softwareCompetition.projectHeader.prizes = prizes;
	   mainWidget.softwareCompetition.projectHeader.projectStudioSpecification.roundOneIntroduction = round1Info;
	   mainWidget.softwareCompetition.projectHeader.projectStudioSpecification.roundTwoIntroduction = round2Info;
	   mainWidget.softwareCompetition.subEndDate = new Date();
	   mainWidget.softwareCompetition.subEndDate.setTime(startDate.getTime() + (milestoneDateHours + subEndDateHours) * 60 * 60 * 1000);
   }
   return true;
}

function showRoundSectionDisplay() {
	$(".contest_round").css("display","block");
	$(".contest_round_edit").css("display","none");
}

function showRoundSectionEdit() {
	$(".contest_round").css("display","none");
	$(".contest_round_edit").css("display","block");
	$(".roundelect select,.startEtSelect select,.milestoneEtSelect select,.numSelect select,.endEtSelect select").each(function(index){
		if(!$(this).is(":hidden") && !$(this).data('customized')){
			$(this).data('customized',true);
			$(this).sSelect({ddMaxHeight: '220',yscroll: true});
		}
	}); 
	if (!hasMultiRound(mainWidget.softwareCompetition.projectHeader.projectCategory.id) || !canEditMultiRound) {
		$('#type').hide();
   	} else {
		$('#type').show();
	}
}

/**
 * Prize Section Functions
 */
function populatePrizeSection(initFlag) {
  //billing account
  var billingProjectId = mainWidget.softwareCompetition.projectHeader.getBillingProject(); 
  $('#billingProjects').getSetSSValue(billingProjectId);
  //potential rollback
	$('#billingProjects').trigger("change");
	if(isBillingEditable()) {		
		$('#billingAccountDivEdit').show(); 	  
  } else {
  	$('#billingAccountDivEdit').hide(); 
  }

	if(isBillingViewable()) {
	   $('.billingdisplay').show(); 
     $('#rBillingAccount').html((billingProjectId <= 0)?"&nbsp;":$("#billingProjects option[value="+ billingProjectId +"]").text());	
  } else {
  	 $('.billingdisplay').hide();   	   	 
  }

	if (mainWidget.competitionType == "STUDIO") {
		var prizes = mainWidget.softwareCompetition.projectHeader.prizes;
		var maxPlace = 0;
		for (var i = 1; i <= 5; i++) {
			$('#rPrize' + i).text('');
			$('#prize' + i).val('');
		}
		for (var i = 0; i < prizes.length; i++) {
			if (prizes[i].prizeType.id == CONTEST_PRIZE_TYPE_ID) {
				maxPlace = Math.max(maxPlace, prizes[i].place);
				$('#rPrize'+prizes[i].place).text('$'+prizes[i].prizeAmount.formatMoney(2));
			    $('#prize'+prizes[i].place).val(prizes[i].prizeAmount);
			}
		}
		if (maxPlace > 2) {
			// have additional payments
			$('#extraPrizes').show();
		} else {
			$('#extraPrizes').hide();
		}
	} else {
		//edit
		//display
		//set radio button
		var radioButtonValue = (COSTLEVEL_RADIOVALUE_MAP[mainWidget.softwareCompetition.projectHeader.getCostLevel()]) || "medium";	
		$('input[name="prizeRadio"][value="' + radioButtonValue + '"]').attr("checked","checked");
	
	   // if init flag is true - open contest detail page - show actual cost data
       if(!initFlag) { fillPrizes(); } else { updateContestCostData();}
	}
	// TODO: need to update getCurrentContestTotal to work with studio contest
    
	if(initFlag) {
		//show activate button if it needs to : the fee is not paied up fully
		if(mainWidget.softwareCompetition.projectHeader.projectStatus.name == DRAFT_STATUS) {
			$('#resubmit').show();
            $(".activateButton").show();
            startedContest = false;
		}         
	}
    preCost = retrieveContestCostWithoutAdminFee();
}

/**
 * Show the contest cost data according to the actual contest cost returned from server.
 */
function updateContestCostData() {
    if (!mainWidget.softwareCompetition.projectHeader.projectCategory || mainWidget.softwareCompetition.projectHeader.projectCategory.id < 0) {
        return;
    }

    var prizeType = $('input[name="prizeRadio"]:checked').val();
    var projectCategoryId = mainWidget.softwareCompetition.projectHeader.projectCategory.id + "";
    var feeObject = softwareContestFees[projectCategoryId];
    if (!feeObject && mainWidget.competitionType != 'STUDIO') {
        showErrors('no fee found for project category ' + projectCategoryId);
        return;
    }

    // gets all cost data from contest data
    var p = mainWidget.softwareCompetition.projectHeader.properties;
    var firstPlacePrize = parseFloat(p['First Place Cost']);
    var secondPlacePrize = parseFloat(p['Second Place Cost']);
    var reviewCost = parseFloat(p['Review Cost']);
    var reliability = parseFloat(p['Reliability Bonus Cost']);
    var specReview = parseFloat(p['Spec Review Cost']);
    var digitalRun = parseFloat(p['DR points']);
    var contestFee = parseFloat(p['Admin Fee']);
    var contestPercentage = parseFloat(p['Contest Fee Percentage']);
    var copilotFee = parseFloat(mainWidget.softwareCompetition.copilotCost);
    
    // (1) set the first place prize
    $('#swFirstPlace').val(firstPlacePrize.formatMoney(2));
    $('#rswFirstPlace').html(firstPlacePrize.formatMoney(2));

    // (2) set the second place prize
    $('#swSecondPlace,#rswSecondPlace').html(secondPlacePrize.formatMoney(2));

    // (3) set the review cost
    $('#swReviewCost,#rswReviewCost').html(reviewCost.formatMoney(2));

    // (4) set the reliability
    $('#swReliabilityBonus,#rswReliabilityBonus').html(reliability.formatMoney(2));

    // (5) set the digital run
    $('#rswDigitalRun').html(digitalRun.formatMoney(2));
    $('#swDigitalRun').val(digitalRun.formatMoney(2));
    originalPrizes = [];
    originalPrizes.push(firstPlacePrize + '');
    originalPrizes.push(digitalRun + '');

    // (6) set the contest fee
    if (contestPercentage!= null && contestPercentage > 0) {
       $('#rswContestFee').html(contestFee.formatMoney(2) + ' (' + contestPercentage * 100 + '% markup)');
       $('#swContestFee').html(contestFee.formatMoney(2));
    } else {
       $('#swContestFee,#rswContestFee').html(contestFee.formatMoney(2));
    }

    // (7) set the copilot cost
    $('#swCopilotFee,#rswCopilotFee').html(copilotFee.formatMoney(2));

    // (8) set the spec review cost
    $('#swSpecCost,#rswSpecCost').html(specReview.formatMoney(2));

    var total = firstPlacePrize + secondPlacePrize + reviewCost + reliability + specReview + digitalRun + contestFee + copilotFee;

    $('#swTotal,#rswTotal').html(total.formatMoney(2));

    //totals
    if (mainWidget.competitionType != 'STUDIO') {
        $('#swPrize_low').html((getContestTotal(feeObject, 'low') + mainWidget.softwareCompetition.copilotCost).formatMoney(2));
        $('#swPrize_medium').html((getContestTotal(feeObject, 'medium') + mainWidget.softwareCompetition.copilotCost).formatMoney(2));
        $('#swPrize_high').html((getContestTotal(feeObject, 'high') + mainWidget.softwareCompetition.copilotCost).formatMoney(2));
    }

    //if custom, make the first place editable
   if(prizeType == 'custom') {
      $('#swFirstPlace').attr('readonly',false);
      $('#swFirstPlace').val(firstPlacePrize.formatMoney(2));

      $('#swDigitalRun').attr('readonly',false);
      $('#swDigitalRun').val(digitalRun.formatMoney(2));
       originalPrizes = [];
       originalPrizes.push(firstPlacePrize + '');
       originalPrizes.push(digitalRun + '');
   } else {
      $('#swFirstPlace').attr('readonly',true);
      $('#swDigitalRun').attr('readonly',true);
   }
}

function isBillingViewable() {
	// billing can not be found, meaning is not eligible, don't show/edit
	// or not set yet, allow edit
	var billingProjectId = mainWidget.softwareCompetition.projectHeader.getBillingProject();  
	return billingProjectId <=0 || $("#billingProjects option[value="+ billingProjectId +"]").length == 1;
}

function isBillingEditable() {
	 var draft = (DRAFT_STATUS == mainWidget.softwareCompetition.projectHeader.projectStatus.name);
	 return isBillingViewable() && draft;
}

function savePrizeSection() {
   if(!validateFieldsPrizeSection()) {
       return;
   }

   //construct request data
   fixFileTypeIds();
   var request = saveAsDraftRequest();

    if (startedContest) {
        var billingProjectId = mainWidget.softwareCompetition.projectHeader.getBillingProject();

        if(billingProjectId <= 0) {
            showErrors("no billing project is selected.");
            return;
        }
        request['activationFlag'] = true;
    }
    
   $.ajax({
      type: 'POST',
      url: ctx + "/launch/saveDraftContest",
      data: request,
      cache: false,
      dataType: 'json',
      success: function(jsonResult) {
         handleSaveAsDraftContestResult(jsonResult);
         populatePrizeSection();  
         showPrizeSectionDisplay();      
         if (mainWidget.competitionType == "STUDIO") {
            var billingProjectId = mainWidget.softwareCompetition.projectHeader.getBillingProject();
            if (billingFeesPercentage[billingProjectId]!= null && billingFeesPercentage[billingProjectId].contestFeePercentage!=null) {
                populateTypeSection();
            }
         }			
      },
      beforeSend: beforeAjax,
      complete: afterAjax            
   });	 
}

function validateFieldsPrizeSection() {
	//validation
	var errors = [];

	if (mainWidget.competitionType == "SOFTWARE") {
		var prizeType = $('input[name="prizeRadio"]:checked').val();
		if(prizeType == 'custom') {
			var value = $('#swFirstPlace').val();
			if(!checkRequired(value) || !checkNumber(value)) {
				errors.push('first place value is invalid.');
			}
		}

        if (phaseOpen) {
            var newFirstPlacePrize = $('#swFirstPlace').val();
            var newDigitalRun = $('#swDigitalRun').val();
            if (checkNumber(newFirstPlacePrize)) {
                if (checkNumber(originalPrizes[0])) {
                    if (parseFloat(newFirstPlacePrize) < parseFloat(originalPrizes[0])) {
                        errors.push('The prizes can not be decreased');
                    }
                }
            }
            if (checkNumber(newDigitalRun)) {
                if (checkNumber(originalPrizes[1])) {
                    if (parseFloat(newDigitalRun) < parseFloat(originalPrizes[1])) {
                        errors.push('The DR points can not be decreased');
                    }
                }
            }
        }
	} else {
		var prizes = mainWidget.softwareCompetition.projectHeader.prizes;
		if (!prizes) {
			prizes = [];
		}
		var ind = getMilestonePrize(prizes);
		// store milestone prizes first
		var milestonePrize = null;
		if (ind != -1) {
			milestonePrize = prizes[ind];
		}
		
		var prizes = validatePrizes(errors);
		var dr = 0;
		for(var i = 0, len = prizes.length; i < len; i++) {
			dr += prizes[i].prizeAmount;
		}
		if (!prizes) {
			prizes = [];
		}
		if (milestonePrize) {
			dr += parseInt($('#milestoneSubmissionNumber').val()) * milestonePrize.prizeAmount;
			prizes.push(milestonePrize);
		}

		//save the DR points
		mainWidget.softwareCompetition.projectHeader.properties['DR points'] = dr * 0.25;
	}
	
    if (isActiveContest) {
        var totalCostWithoutAdminFee = retrieveContestCostWithoutAdminFee();
        if (totalCostWithoutAdminFee < preCost) {
            errors.push('The cost of active contest should not be decreased.');
        }
    }
   
	if(errors.length > 0) {
		showErrors(errors);
		return false;
	}
   
	if(isBillingEditable()) {		
		var billingProjectId = $('select#billingProjects').val();
		mainWidget.softwareCompetition.projectHeader.setBillingProject(billingProjectId);
	}
   // add copilot cost into project header
   mainWidget.softwareCompetition.projectHeader.setCopilotCost(mainWidget.softwareCompetition.copilotCost);

	if (mainWidget.competitionType == "SOFTWARE") {
		updateSoftwarePrizes();
	} else {
		mainWidget.softwareCompetition.projectHeader.prizes = prizes;
	}
	
	return true;	
}

function showPrizeSectionDisplay() {
	$(".contest_prize").css("display","block");
	$(".contest_prize_edit").css("display","none");
}

function showPrizeSectionEdit() {
    if (mainWidget.competitionType == "SOFTWARE") {
        var p = mainWidget.softwareCompetition.projectHeader.properties;
        var firstPlacePrize = parseFloat(p['First Place Cost']);
        var digitalRun = parseFloat(p['DR points']);
        originalPrizes = [];
        originalPrizes.push(firstPlacePrize + '');
        originalPrizes.push(digitalRun + '');
    } else {
        originalPrizes = [];
        for (var i = 1; i <=5; i++) {
            var value = $('#prize' + i).val();
            if ($.trim(value).length > 0) {
                originalPrizes.push(value);
            }
        };
    }
    
	$(".contest_prize").css("display","none");
	$(".contest_prize_edit").css("display","block");
	if(!$(".prizeBillingSelect select").data('customized')){
		$(".prizeBillingSelect select").data('customized',true);
      	$(".prizeBillingSelect select").sSelect({ddMaxHeight: '220',yscroll: true});
    }

    fillPrizes();
}

/**
 * Gets the default file types and other format file types from a list of file types.
 * 
 * @param allFileTypes the list of file type.
 * @returns the default file types and other format file types
 */
function getSplitFileTypes(allFileTypes) {
	var defaultFileTypes = [];
	var otherFileTypes = [];
    var predefinedFileTypes = [];
	if (mainWidget.softwareCompetition.projectHeader.projectCategory.id > 0) {
		for (var i = 0; i < fileTypes.length; i++) {
			if (fileTypes[i].id == mainWidget.softwareCompetition.projectHeader.projectCategory.id) {
                predefinedFileTypes = fileTypes[i].fileFormats;
                for (var k = 0; k < allFileTypes.length; k++) {
                    var matched = false;
                    for (var j = 0; j < fileTypes[i].fileFormats.length; j++) {
                            if(fileTypes[i].fileFormats[j].description == allFileTypes[k] || fileTypes[i].fileFormats[j].value == allFileTypes[k]) {
                                defaultFileTypes.push(fileTypes[i].fileFormats[j]);
                                matched = true;
                                break;
                            }
                    }
                    if (!matched) {
                        otherFileTypes.push(allFileTypes[k]);
	                }
		        }
                break;
            }
		}
	}
	return [defaultFileTypes, otherFileTypes, predefinedFileTypes];
}

/**
 * Spec Section Functions
 */
/**
 * Populate spec section.
 *
 * @param initFlag initiation Flag when the section is first populated. It is for some special action only performed when
 * first time initialized. It could be ignored if it is not first time initialized.
 */ 
function populateSpecSection(initFlag) {	
   var detailedRequirements = mainWidget.softwareCompetition.projectHeader.projectSpec.detailedRequirements;
   var guidelines = mainWidget.softwareCompetition.projectHeader.projectSpec.finalSubmissionGuidelines;
   var privateDescription = mainWidget.softwareCompetition.projectHeader.projectSpec.privateDescription;
	
	//edit
	$('#swDetailedRequirements').val(detailedRequirements);
	$('#swGuidelines').val(guidelines);		
    $('#swPrivateDescription').val(privateDescription);
    
    if(isDevOrDesign()) {  	   
       if(mainWidget.softwareCompetition.assetDTO.directjsRootCategoryId != $('#catalogSelect').val() || initFlag){ 
          $('#catalogSelect').val(mainWidget.softwareCompetition.assetDTO.directjsRootCategoryId);
          updateCategories(fillCategories);
       } else {
       	  fillCategories();
       }       
  } 

  if(isTechnologyContest()) {
  	   //technlogies
  	   $('#masterTechnologiesSelect').val(mainWidget.softwareCompetition.assetDTO.directjsTechnologies);
       $('#masterTechnologiesSelect option:selected').appendTo('#masterTechnologiesChoosenSelect');
       sortTechnologySelects();                	
  }
  
  // for studio
  if (mainWidget.competitionType == "STUDIO") {
	  $('#contestIntroduction').val(mainWidget.softwareCompetition.projectHeader.projectStudioSpecification.contestIntroduction);
	  $('#contestDescription').val(mainWidget.softwareCompetition.projectHeader.projectStudioSpecification.contestDescription);
	  $('#deliverablesCheckboxs').html('');
	  var types = getSplitFileTypes(mainWidget.softwareCompetition.fileTypes);
	  // default types
      var predefinedFileTypes = types[2];
	  var html = "";

      $.each(predefinedFileTypes, function(i, type) {
          var selected = false;
          $.each(types[0], function(i, type1) {
              if(type1.description == type.description) {
                  selected = true;
              }
	      });

          if(selected) {
              html += '<div><input type="checkbox" checked="checked" value="' + type.value +'" class="defaultFileType" /> <label>' + type.description + '</label></div>';
          } else {
              html += '<div><input type="checkbox" value="' + type.value +'" class="defaultFileType" /> <label>' + type.description + '</label></div>';
          }
      });

	  // other file types
	  $.each(types[1], function(i, type) {
	      html += '<div><input type="checkbox" checked="checked" />&nbsp;&nbsp;<input type="text" class="text fileInput" value="' + type + '"/></div>';
	  });
	  $('#deliverablesCheckboxs').html(html);
  }
		
  //display
  $('#rswDetailedRequirements').html(detailedRequirements);   
  $('#rswGuidelines').html(guidelines);   
  $('#rswPrivateDescription').html(privateDescription);
  
  if(isDevOrDesign()) {
     $('#rswRootCatalog').html($("#catalogSelect option[value="+ mainWidget.softwareCompetition.assetDTO.directjsRootCategoryId +"]").text());
     
     var html = "";
     $.each($('#select2_categories option'),function(i,option){
     	  html += option.text +"<br/>";
     });
     $('#rswCategories').html(html);     
  } 

  if(isTechnologyContest()) {
  	 var html = "";
     $.each($('#masterTechnologiesChoosenSelect option'),function(i,option){     	  
     	  html += option.text +"<br/>";
     });
     $('#rswTechnologies').html(html);     
  } 
  
  // For studio
  if (mainWidget.competitionType == "STUDIO") {
	  $('#rContestIntroduction').html(mainWidget.softwareCompetition.projectHeader.projectStudioSpecification.contestIntroduction);   
	  $('#rContestDescription').html(mainWidget.softwareCompetition.projectHeader.projectStudioSpecification.contestDescription);
	  html = "";
      var studioSubtypeId = mainWidget.softwareCompetition.projectHeader.projectCategory.id;
      var types = getStudioFileTypes(studioSubtypeId);
	  $.each(mainWidget.softwareCompetition.fileTypes, function(i, fileType) {
		  if(isNotEmpty(fileType+"")) {
              var found = false;
              for (var i = 0; i < types.length; i++) {
                  if(types[i].value == fileType) {
                      html += '<li>'+ types[i].description +'</li>';
                      found = true;
                      break;
                  }
              }
              if(!found) {
			  html += '<li>'+ fileType +'</li>';
              }
		  }
	  });
	  $('#rFinalDeliveries').html(html);
	  $('#allowStockArt').attr('checked', mainWidget.softwareCompetition.projectHeader.properties['Allow Stock Art'] == 'true');
	  $('#rContestStockArt').html((mainWidget.softwareCompetition.projectHeader.properties['Allow Stock Art'] == 'true') ? 'Stock Arts allowed' : 'Stock Arts not allowed');

      if ($('#viewableSubmFlag').length) {
          $('#viewableSubmFlag').attr('checked', mainWidget.softwareCompetition.projectHeader.properties['Viewable Submissions Flag'] == 'true');
          if (mainWidget.softwareCompetition.projectHeader.isLccchecked()) {
                $("#viewableSubmFlag").attr("disabled","disabled");
                $("#viewableSubmFlag").attr("checked","");
          } else {
                $("#viewableSubmFlag").attr("disabled","");
          }
      }
      if (mainWidget.softwareCompetition.projectHeader.isLccchecked()) {
        $("#contestIntroduction").parent().find(".mceFooterNote").show();
      } else {
        $("#contestIntroduction").parent().find(".mceFooterNote").hide();
      }

      if ($('#rViewableSubmFlag').length) {
	      $('#rViewableSubmFlag').html((mainWidget.softwareCompetition.projectHeader.properties['Viewable Submissions Flag'] == 'true') ? 'Submissions are viewable' : 'Submissions are not viewable');
      }
      if ($('#maxSubmissions').length) {
          $('#maxSubmissions').val(mainWidget.softwareCompetition.projectHeader.properties['Maximum Submissions']);
      }

      if ($('#rMaxSubmissions').length) {
          if (mainWidget.softwareCompetition.projectHeader.properties['Maximum Submissions'] == '') {
              $('#rMaxSubmissions').html("There are no limits on number of submissions");
          } else {
              $('#rMaxSubmissions').html("Maximum " + mainWidget.softwareCompetition.projectHeader.properties['Maximum Submissions'] + " submissions allowed in each round");
          }
      }
  }
}

function saveSpecSection() {
   if(!validateFieldsSpecSection()) {
       return;
   }

   //construct request data
   var request = saveAsDraftRequest();

   $.ajax({
      type: 'POST',
      url: ctx + "/launch/saveDraftContest",
      data: request,
      cache: false,
      dataType: 'json',
      success: function(jsonResult) {
         handleSaveAsDraftContestResult(jsonResult);
         populateSpecSection();  
         showSpecSectionDisplay();         			
      },
      beforeSend: beforeAjax,
      complete: afterAjax            
   });	 
}

function validateFieldsSpecSection() {
   var detailedRequirements = getTinyMCEContent('swDetailedRequirements');
   var softwareGuidelines = getTinyMCEContent('swGuidelines'); 
   var privateDescription = getTinyMCEContent('swPrivateDescription'); 
   var contestDescription = getTinyMCEContent('contestDescription');
   var contestIntroduction = getTinyMCEContent('contestIntroduction'); 
   
   var rootCategoryId = $('#catalogSelect').val();
	
   //validation
   var errors = [];

   if (mainWidget.competitionType == "STUDIO") {
	   if(!checkRequired(contestIntroduction)) {
	       errors.push('Contest introduction is empty.');
	   }

	   if(!checkRequired(contestDescription)) {
	       errors.push('Contest description is empty.');
	   }
	   
	   var fileTypesResult = validateFileTypes(errors);
	   var fileTypes = fileTypesResult[0];
	   var otherFileTypes = fileTypesResult[1];
   } else {
	   if (mainWidget.softwareCompetition.projectHeader.projectCategory.id != 29 ) {
		   if(!checkRequired(detailedRequirements)) {
			   errors.push('Detailed requirements is empty.');
		   }

		   if(!checkRequired(softwareGuidelines)) {
			   errors.push('Software guidelines is empty.');
		   }

		   if(isDevOrDesign()) {
			   if( rootCategoryId <= 0 ) {
				   errors.push('No catalog is selected.');
			   }
	      
			   if($('#select2_categories option').length == 0) {
				   errors.push('No category is selected.');
			   }
		   }

		   if(isTechnologyContest()) {
			   if($('#masterTechnologiesChoosenSelect option').length == 0) {
				   errors.push('No technology is selected.');
			   }      
		   }
	   }
   }

   var maxSubmissions = $('#maxSubmissions').val();

   if (!(optional(maxSubmissions) || (/^\d+$/.test(maxSubmissions) && parseInt(maxSubmissions) > 0))) {
      errors.push('Max Submissions field should be empty or positive integer.');
   }
	
   if(errors.length > 0) {
       showErrors(errors);
       return false;
   }
   
   if (mainWidget.competitionType == "STUDIO") {
	   mainWidget.softwareCompetition.projectHeader.projectStudioSpecification.contestDescription = contestDescription;
	   mainWidget.softwareCompetition.projectHeader.projectStudioSpecification.contestIntroduction = contestIntroduction;
	   mainWidget.softwareCompetition.fileTypes = fileTypes.concat(otherFileTypes);
   } else {
	   mainWidget.softwareCompetition.projectHeader.projectSpec.detailedRequirements = detailedRequirements;
	   mainWidget.softwareCompetition.projectHeader.projectSpec.finalSubmissionGuidelines = softwareGuidelines;
	   mainWidget.softwareCompetition.projectHeader.projectSpec.privateDescription = privateDescription;
   }
   
   if(isDevOrDesign()) {
     mainWidget.softwareCompetition.assetDTO.directjsRootCategoryId = rootCategoryId;
     mainWidget.softwareCompetition.assetDTO.directjsCategories =
      $.map($('#select2_categories option'), function(option,i){
     	   return option.value;
     });   
   }
   
   if(isTechnologyContest()) {
     mainWidget.softwareCompetition.assetDTO.directjsTechnologies =
      $.map($('#masterTechnologiesChoosenSelect option'), function(option,i){
     	   return option.value;
     });   
   }
   
   mainWidget.softwareCompetition.projectHeader.properties['Allow Stock Art'] = '' + $('#allowStockArt').is(":checked");
   // sets the Maximum Submissions
   if ($.trim(maxSubmissions).length == 0) {
       mainWidget.softwareCompetition.projectHeader.properties['Maximum Submissions'] = '';
   } else {
       mainWidget.softwareCompetition.projectHeader.properties['Maximum Submissions'] = parseInt(maxSubmissions);
   }
   mainWidget.softwareCompetition.projectHeader.properties['Viewable Submissions Flag'] = '' + $('#viewableSubmFlag').is(":checked");

   return true;	
}

function showSpecSectionDisplay() {
		$(".contest_spec").css("display","block");
		$(".contest_spec_edit").css("display","none");												
}

function showSpecSectionEdit() {
		$(".contest_spec").css("display","none");
		$(".contest_spec_edit").css("display","block");												
}

/**
 * Document Section Functions
 */
// document array used for rollback for cancel button 
var rbDocuments; 

/**
 * Set rollback documents. It simply takes the snapshot of current swDocuments array.
 */
function setRollbackDocuments() {
	rbDocuments = swDocuments.slice(0);
}

/**
 * rolls back the document
 */
function rollbackDocuments() {
	swDocuments = rbDocuments.slice(0);
}

function populateDocumentSection() {
	//edit
  swRefreshDocuments();	
	
	//display
	var html = "";
	var template = unescape($('#documentTemplate tbody').html());
	$.each(swDocuments, function(i,document) {
		 html += $.validator.format(template,(i+1),document['fileName'],document['description'], document['documentId']);
	});
	$('#documentTable').html(html);
	
   if(hasRequirementDocument()) {
      $('.reqDocCheck').hide();
   }	
}

function showDocumentSectionDisplay() {
	 $(".contest_files").css("display","block");
	 $(".contest_files_edit").css("display","none");												
}

function showDocumentSectionEdit() {
	 $(".contest_files").css("display","none");
	 $(".contest_files_edit").css("display","block");												
}

function saveDocumentSection() {
   //construct request data
   fixFileTypeIds();
   var request = saveAsDraftRequest();

   $.ajax({
      type: 'POST',
      url: ctx + "/launch/saveDraftContest",
      data: request,
      cache: false,
      dataType: 'json',
      success: function(jsonResult) {
         handleSaveAsDraftContestResult(jsonResult);
		 // gets the documents details
	   $.ajax({
		  type: 'POST',
		  url:  ctx+"/contest/detailJson",
		  data: {"projectId":paramContestId},
		  cache: false,
		  dataType: 'json',
		  async : false,
		  success: function (jsonResult) {
			  handleJsonResult(jsonResult,
			  function(result) {
				 //documentations, each doc has fields of documentId, fileName, description, documentTypId, url
				 swDocuments = result.documentation;
				 // mark them as documentation
				 $.each(swDocuments, function(i, doc) {
					  doc['comp'] = true;
				 });      
				 setRollbackDocuments();
				 populateDocumentSection();  
				 showDocumentSectionDisplay();    
			  },
			  function(errorMessage) {
				  showServerError(errorMessage);
			  })
		  }
	   });			
      },
      beforeSend: beforeAjax,
      complete: afterAjax            
   });
}


/**
 * Activation in edit page
 */
function activateContestEdit() {	
   var billingProjectId = mainWidget.softwareCompetition.projectHeader.getBillingProject()
   
   if(billingProjectId <= 0) {
   	  showErrors("no billing project is selected.");
   	  return;
   }

    if (contestHasSpecReview) {
        showActivateSpecReviewModal();
    } else {
        activateAndStartSpecReview('none');
    }

}

/**
 * Show activate and start spec review modal.
 *
 * @since 1.6
 */
function showActivateSpecReviewModal() {
    // show spec review popup
    $('#TB_overlay').show();
    $('#TB_window_custom').show();
    $('.TB_overlayBG').css('height', document.body.scrollHeight > document.body.offsetHeight ? document.body.scrollHeight : document.body.offsetHeight);
    $('#TB_window_custom').css({
        //'margin': '0 auto 0 ' + parseInt((document.documentElement.clientWidth / 2) - ($("#TB_window_custom").width() / 2)) + 'px'
        'left':$(window).width() / 2 - $('#TB_window_custom').width() / 2,
        'top':($(window).height() / 2 - $('#TB_window_custom').height() / 2) + $(window).scrollTop()
    });

    // set button click
    $('#TB_window_custom .review-now').attr("href", "javascript:activateAndStartSpecReview('now')");
    $('#TB_window_custom .review-later').attr("href", "javascript:activateAndStartSpecReview('later')");
}

/**
 * Hides activate and start spec review modal.
 *
 * @since 1.6
 */
function hideActivateSpecReviewModal() {
    $('#TB_overlay').hide();
    $('#TB_window_custom').hide();
}

function activateAndStartSpecReview(mode) {
    //construct request data
    fixFileTypeIds();
    var request = saveAsDraftRequest();
    request['activationFlag'] = true;
    request['specReviewStartMode'] = mode;

    $.ajax({
        type: 'POST',
        url:  ctx + "/launch/saveDraftContest",
        data: request,
        cache: false,
        dataType: 'json',
        success: handleActivationResultEdit,
        beforeSend: function() {
            hideActivateSpecReviewModal();
            modalPreloader();
        },
        complete: afterAjax
    });
}


function handleActivationResultEdit(jsonResult) {
    handleJsonResult(jsonResult,
    function(result) {
        mainWidget.softwareCompetition.paidFee = result.paidFee;
        // can't change the multiple - round type if contest is not draft
        if (result.projectStatus.name != DRAFT_STATUS) {
            canEditMultiRound = false;
            $('#resubmit').hide();
            $(".activateButton").hide();
        }
        var contestName = mainWidget.softwareCompetition.assetDTO.name;
        var specResponse = " and specification review has bee scheduled.";
        if(!contestHasSpecReview) {
            specResponse = ".";
        }
        showSuccessfulMessage("Contest <span class='messageContestName'>" + contestName +"</span> has been activated successfully" + specResponse);
    },
    function(errorMessage) {
        showServerError(errorMessage);
    });
}

$(function() {
    /**
     * Show spec review pop window.
     */
    $('.specrev-goto').click(function(){
        $('#TB_overlay').show();
        $('#TB_window_custom').show();
        $('.TB_overlayBG').css('height',document.body.scrollHeight > document.body.offsetHeight ? document.body.scrollHeight : document.body.offsetHeight);
        $('#TB_window_custom').css({
            //'margin': '0 auto 0 ' + parseInt((document.documentElement.clientWidth / 2) - ($("#TB_window_custom").width() / 2)) + 'px'
            'left' : $(window).width() / 2-$('#TB_window_custom').width() / 2,
            'top' : ($(window).height() / 2-$('#TB_window_custom').height() / 2) + $(window).scrollTop()
        });
    });
    //$('#TB_window_custom').scrollFollow({offset: parseInt((document.documentElement.clientHeight / 2) - (parseInt($("#TB_window_custom").css('height')) / 2))});
});


function showSpecReview(contestJson) {

   var startSpecReviewUrl = "../contest/startSpecReview.action?projectId=";
   var PROJECT_STATUS_ACTIVE = 1;
   contestHasSpecReview = contestJson.hasSpecReview;
   // only if contest is active (activated), has spec review phases, and sepc review phaase have not started
   if(contestJson.hasSpecReview && !contestJson.isSpecReviewStarted 
          && contestJson.projectStatus.id == PROJECT_STATUS_ACTIVE) {

       $.ajax({
           type: 'POST',
           url:  ctx+"/contest/specReviewScheduled",
           data: {"projectId":paramContestId},
           cache: false,
           dataType: 'json',
           async : true,
           success: function (jsonResult) {
               handleJsonResult(jsonResult,
                   function(result) {
                        if(result.specReviewScheduled) {
                            $('#swEdit_bottom_review').hide();
                        } else {
                            $('#swEdit_bottom_review').show();
                        }
                   },
                   function(errorMessage) {
                       showServerError(errorMessage);
                   })
           }
       });

       startSpecReviewUrl += contestJson.contestId + "&studio=false&";


   }
   $('#TB_window_custom .review-now').attr("href", startSpecReviewUrl + "startMode=now");
   $('#TB_window_custom .review-later').attr("href", startSpecReviewUrl + "startMode=later");

}

/**
 * Gets copilots for direct project.
 *
 * @param directProjectId the direct project id
 */
function getCopilotsByDirectProjectId(directProjectId) {

    var returnValue = {};

    var request = {directProjectId:directProjectId};

    $.ajax({
       type: 'POST',
       url:  ctx + "/launch/getDirectProjectCopilots",
       data: request,
       cache: false,
       async: false,
       dataType: 'json',
       success: function(jsonResult) {
           handleJsonResult(jsonResult,
           function(result) {
               returnValue.copilots = result.copilots;
               returnValue.selected = result.selected;
           },
           function(errorMessage) {
               showServerError(errorMessage);
           });
       }
    });
    return returnValue;
}

// method to populate copilots selection based on the project selection change
function handleProjectDropDownChange() {
    var value = $('#projects').getSetSSValue();

    var result = getCopilotsByDirectProjectId(value);

    var copilots = result.copilots;
    var selected = result.selected;
    var $contestCopilots = $("#copilots");

    $contestCopilots.html("");

    $contestCopilots.append($('<option></option>').val(0).html("Unassigned"));

    $.each(copilots, function(key, value) {

        $contestCopilots.append($('<option></option>').val(key).html(value));
    });

    // set the selection drop down value
    $contestCopilots.val(selected);

    $('#copilots').resetSS();
    $('#copilots').getSetSSValue(selected);
}

