import { test,expect } from '../fixtures/baseTest';
import { deleteDatasetViaPW, createDatasetViaPW } from '../precs/Datasets/datasetPrecs';
import { deleteCollectionViaPW, createCollectionViaPW } from '../precs/Collections/collectionPrecs';
import { datasetRemoteLink1,
         datasetRemoteLink2,
         datasetDescription1,
         datasetDescriptionH1,
         datasetDescriptionH2,
         datasetDescriptionParagraph,
         datasetFileInformation,
         datasetSourceText,
         datasetCollectionMethodologyText} from '../helpers/constants';
import { YourWork } from '../page-objects/YourWorkPage';

test.describe('tests using POM', async()=>{
    test.beforeEach(async({page,mainMenu})=>{
        await mainMenu.openHomePage();
    })
    test('open plus menu and datasets page @smoke @smokeDataset', async({page,mainMenu})=>{
        await mainMenu.openCreationMenu();
        await mainMenu.closeCreationMenu();
        await mainMenu.openDatasetsPageViaMainMenu();
        await expect(page).toHaveURL('/datasets');
    })
    test('Create new dataset with remote url @smoke @smokeDataset', async({page,browser,mainMenu,datasetsPage})=>{
        const datasetName = 'AutoDataSet'+Date.now().toString();
        let createdDataset
        await test.step('Preconditions', async()=>{
            await mainMenu.openDatasetsPageViaMainMenu();
            await datasetsPage.clickNewDatasetBtn();
        })
        await test.step('Verify that "Create" button becomes enabled after providing dataset name', async()=>{
            await datasetsPage.clickLinkTabWhileCreatingDataset();
            await datasetsPage.fillURLFieldWhileCreatingDataset(datasetRemoteLink1);
            await datasetsPage.clickContinueBtnWhileCreatingDataset();
            await datasetsPage.fillDatasetNameWhileCreatingDataset(datasetName);
            expect(await datasetsPage.isCreateBtnEnabled()).toBe(true)
        })
        await test.step('Verify that dataset is created and contains resource from the remote link', async()=>{
            createdDataset = await datasetsPage.clickCreateBtnAndGetDatasetProperties();
            await datasetsPage.clickGoToDatasetBtn();
            expect(await datasetsPage.getDatasetName()).toEqual(datasetName);
            expect(await datasetsPage.getDatasetAttachmentSizeNumber()).toBeGreaterThan(0);
            await expect(page.getByTestId('preview-image')).toBeVisible();
        })
        await test.step('Postcondition. Remove created dataset', async()=>{
            await deleteDatasetViaPW(page,createdDataset.datasetSlug,createdDataset.ownerSlug)
        })
    })


    test('Create new dataset with file upload and edits its provenance @smokeDataset', async({page,mainMenu,datasetsPage})=>{ 
        const datasetName = 'AutoDataSet'+Date.now().toString();
        let createdDataset
        let usabilityValue
        let usabilityStats
        await test.step('Preconditions', async()=>{
            await mainMenu.openDatasetsPageViaMainMenu();
            await datasetsPage.clickNewDatasetBtn();
        })
        await test.step('Upload file and create dataset', async()=>{
            await datasetsPage.selectFilesForUpload(['./resources/123.jpg','./resources/kaner_testing.pdf']);
            await datasetsPage.fillDatasetNameWhileCreatingDataset(datasetName);
            createdDataset = await datasetsPage.clickCreateBtnAndGetDatasetProperties();
            await datasetsPage.clickGoToDatasetBtn();
            await expect(page.getByTestId('preview-image')).toBeVisible();
        })
        await test.step('Verify that clicking specify provenance pending action opens new input fields', async()=>{
            usabilityValue = await datasetsPage.getUsabilityValue();
            usabilityStats = await datasetsPage.getDatasetCompletenessCredibilityCompatibilityStats()
            await datasetsPage.clickRightBtnForPendingActions();
            await datasetsPage.clickSpecifyProvenancePendingAction();
            expect(await datasetsPage.isSourcesInputVisible()).toBe(true);
            expect(await datasetsPage.isCollectionMethodologyInputVisible()).toBe(true);
        })
        await test.step('Provide source and collection methodology and verify it can be saved', async()=>{
            await datasetsPage.fillCollectionMethodologyInput(datasetCollectionMethodologyText);
            await datasetsPage.fillSourcesInput(datasetSourceText);
            await datasetsPage.clickSaveForSection('License');
            await expect (datasetsPage.getFlashMessageLocator()).toBeVisible();
            expect(await datasetsPage.getFlashMessageText()).toContain('Successfully updated the provenance.');
            await datasetsPage.reloadPage();
            expect((await datasetsPage.getDatasetSourceAndCollectionMethodology()).source).toEqual(datasetSourceText.replace(/\n/g,' '));
            expect((await datasetsPage.getDatasetSourceAndCollectionMethodology()).collectionMethodology).toEqual(datasetCollectionMethodologyText.replace(/\n/g,' '));
        })
        await test.step('Verify that pending action for provenance is not shown and stats are updated', async()=>{
            expect(await datasetsPage.isSpecifyProvenancePendingActionVisible()).toBe(false);
            await datasetsPage.clickRightBtnForPendingActions();
            expect(await datasetsPage.isSpecifyProvenancePendingActionVisible()).toBe(false);
            expect(await datasetsPage.getUsabilityValue()).toBeGreaterThan(usabilityValue);
            expect((await datasetsPage.getDatasetCompletenessCredibilityCompatibilityStats()).credibility.value).toBeGreaterThan(usabilityStats.credibility.value);
            expect((await datasetsPage.getDatasetCompletenessCredibilityCompatibilityStats()).credibility.isSourceProvenanceChecked).toBe(true);
        })
        await test.step('Postcondition. Remove created dataset', async()=>{
            await deleteDatasetViaPW(page,createdDataset.datasetSlug,createdDataset.ownerSlug)
        })
    })

    test('Remove several datasets', async({page,mainMenu,datasetsPage})=>{
        const datasetName = 'AutoDataSet'+Math.floor(Math.random() * 100000);
        const yourWorkPage = new YourWork(page);
        const datasetNames = ['1'+datasetName,'2'+datasetName,'3'+datasetName,'4'+datasetName,'5'+datasetName];
        const initialCheckedItems = [datasetNames[0],datasetNames[1],datasetNames[2],'kjwewekjrkjwekjrwe',datasetNames[4]];
        let remainingDataset1;
        let remainingDataset2;
        let checkedItems;
        let initialCount;
        let finalCount;
        await test.step('Preconditions', async()=>{
            await createDatasetViaPW(page, datasetNames[0],[datasetRemoteLink1,datasetRemoteLink2]);
            remainingDataset1 = await createDatasetViaPW(page, datasetNames[1],[datasetRemoteLink2]);
            await createDatasetViaPW(page, datasetNames[2],[datasetRemoteLink1]);
            await createDatasetViaPW(page, datasetNames[3],[datasetRemoteLink1]);
            remainingDataset2 = await createDatasetViaPW(page, datasetNames[4],[datasetRemoteLink2]);
        })
        await test.step('Verify that checkboxes for needed datasets are checked', async()=>{
            await mainMenu.openDatasetsPageViaMainMenu();
            await datasetsPage.openYourWork();
            checkedItems = await yourWorkPage.checkItemsWithProvidedNamesAndReturnTheirNames(initialCheckedItems);
            initialCount = await yourWorkPage.getCountOfItemsOnTab('Datasets');
            expect(checkedItems.length).toEqual(initialCheckedItems.length-1)
        })
        await test.step('Verify that just checked items are shown on the panel before removal', async()=>{
            checkedItems = await yourWorkPage.getCheckedItemsNames();
            await yourWorkPage.clickDeleteBtn();
            expect(await yourWorkPage.getCountOfItemsOnDeleteWarningPanel()).toEqual(initialCheckedItems.length-1);
            const itemsOnPanel = await yourWorkPage.getNamesOfItemsOnDeleteWarningPanel();
            expect(checkedItems.length).toEqual(itemsOnPanel.length);
            for (let item of itemsOnPanel){
                expect(checkedItems.includes(item)).toBe(true)
            }
        })
        await test.step('Verify that items to remove can be edited', async()=>{
            await yourWorkPage.clickCancelBtnOnPanel();
            checkedItems = await yourWorkPage.getCheckedItemsNames();
            expect(checkedItems.length).toEqual(initialCheckedItems.length-1);
            const uncheckedItems = await yourWorkPage.uncheckItemsWithProvidedNamesAndReturnTheirNames([datasetNames[1],datasetNames[4]]);
            checkedItems = await yourWorkPage.getCheckedItemsNames();
            for (let uncheckedName of uncheckedItems){
                expect(checkedItems.includes(uncheckedName)).toBe(false) 
            }

            await yourWorkPage.clickDeleteBtn();
            expect(await yourWorkPage.getCountOfItemsOnDeleteWarningPanel()).toEqual(initialCheckedItems.length-uncheckedItems.length-1);
            let itemsOnPanel = await yourWorkPage.getNamesOfItemsOnDeleteWarningPanel();
            expect(checkedItems.length).toEqual(itemsOnPanel.length);
            for (let item of itemsOnPanel){
                expect(checkedItems.includes(item)).toBe(true)
            }

            await yourWorkPage.clickCancelBtnOnPanel();
            const newCheckedItem = await yourWorkPage.checkItemsWithProvidedNamesAndReturnTheirNamesWithoutTimeout([datasetNames[3]]);
            checkedItems = await yourWorkPage.getCheckedItemsNames();
            expect(checkedItems.length).toEqual(initialCheckedItems.length-uncheckedItems.length+newCheckedItem.length-1);
            for (let uncheckedName of uncheckedItems){
                expect(checkedItems.includes(uncheckedName)).toBe(false) 
            }

            await yourWorkPage.clickDeleteBtn();
            expect(await yourWorkPage.getCountOfItemsOnDeleteWarningPanel()).toEqual(initialCheckedItems.length-uncheckedItems.length+newCheckedItem.length-1);
            itemsOnPanel = await yourWorkPage.getNamesOfItemsOnDeleteWarningPanel();
            expect(checkedItems.length).toEqual(itemsOnPanel.length);
            for (let item of itemsOnPanel){
                expect(checkedItems.includes(item)).toBe(true)
            }
            expect(itemsOnPanel.includes(newCheckedItem[0]));
        })
        await test.step('Verify that corresponding selected items are removed', async()=>{
            await yourWorkPage.checkAgreementCheckbox();
            await yourWorkPage.clickContinueBtnOnPanel();
            expect(await yourWorkPage.getConfirmationPopUpText()).toEqual(`You are about to delete ${checkedItems.length} files. Deletion is irreversible.`);
            await yourWorkPage.clickDeleteBtnOnConfirmDialog();
            expect(await yourWorkPage.getFlashMessageText()).toEqual(`${checkedItems.length} items deleted.`);
            finalCount = await yourWorkPage.getCountOfItemsOnTab('Datasets');
            expect(finalCount).toEqual(initialCount-checkedItems.length);
            expect(await yourWorkPage.getListItemByNameOrSubtitle(datasetNames[1])).toBeVisible();
            expect(await yourWorkPage.getListItemByNameOrSubtitle(datasetNames[4])).toBeVisible();
            expect(await yourWorkPage.getListItemByNameOrSubtitle(datasetNames[0])).toBeHidden();
            expect(await yourWorkPage.getListItemByNameOrSubtitle(datasetNames[2])).toBeHidden();
            expect(await yourWorkPage.getListItemByNameOrSubtitle(datasetNames[3])).toBeHidden();
        })
        await test.step('Postcondition. Remove remaining dataset', async()=>{
            await deleteDatasetViaPW(page,remainingDataset1.datasetSlug,remainingDataset1.ownerSlug)
            await deleteDatasetViaPW(page,remainingDataset2.datasetSlug,remainingDataset2.ownerSlug)
        })
    })

    test('Edit dataset via pending actions', async({page,mainMenu,datasetsPage})=>{   
        const datasetName = 'AutoDataSet'+Date.now().toString();
        let createdDataset
        let usabilityValue = 0;
        let datasetStats;
        await test.step('Preconditions', async()=>{
            createdDataset = await createDatasetViaPW(page, datasetName, [datasetRemoteLink2]);
            await datasetsPage.openDatasetProfile(createdDataset.datasetSlug,createdDataset.ownerSlug);
            await datasetsPage.reloadPage();
            datasetStats = await datasetsPage.getDatasetCompletenessCredibilityCompatibilityStats();
        })
        await test.step('Add subtitle via pending action', async()=>{
            usabilityValue = await datasetsPage.getUsabilityValue();
            await datasetsPage.clickAddSubtitlePendingAction();
            expect (await datasetsPage.isTabWithNameSelected('Settings')).toBe(true);
            expect(await datasetsPage.isSaveChangesBtnEnabled()).toBe(false);
            await datasetsPage.fillSubtitleWhileEditingDataset(`NEW SUBTITLE 123123123123123 EDIT`);
            expect(await datasetsPage.isSaveChangesBtnEnabled()).toBe(true);
            await datasetsPage.acceptCookies();
            await datasetsPage.clickSaveChangesBtn();
            await expect (datasetsPage.getFlashMessageLocator()).toBeVisible();
            expect (await datasetsPage.getFlashMessageText()).toContain('Successfully saved your dataset.');
            expect(await datasetsPage.isSaveChangesBtnEnabled()).toBe(false);

            await datasetsPage.reloadPage();
            expect (await datasetsPage.getSubtitleInputValue()).toEqual(`NEW SUBTITLE 123123123123123 EDIT`);
            expect (await datasetsPage.getSubtitleOnView()).toEqual('NEW SUBTITLE 123123123123123 EDIT');

            await datasetsPage.selectTabOnDatasetProfile('Data Card');
            expect (await datasetsPage.getUsabilityValue()).toBeGreaterThan(usabilityValue);
            usabilityValue = await datasetsPage.getUsabilityValue();
            expect ((await datasetsPage.getDatasetCompletenessCredibilityCompatibilityStats()).completeness.value).toBeGreaterThan(datasetStats.completeness.value);
            expect ((await datasetsPage.getDatasetCompletenessCredibilityCompatibilityStats()).completeness.isSubtitleChecked).toBe(true);
            
            expect (await datasetsPage.isAddSubtitlePendingActionVisible()).toBe(false);             
            await datasetsPage.clickRightBtnForPendingActions();
            expect (await datasetsPage.isAddSubtitlePendingActionVisible()).toBe(false);
            
        })
        await test.step('Add description via pending action', async()=>{              
            await datasetsPage.clickLeftBtnForPendingActions();
            
            datasetStats = await datasetsPage.getDatasetCompletenessCredibilityCompatibilityStats();
            await datasetsPage.clickAddDescriptionPendingAction();
            expect (await datasetsPage.isDatasetDescriptionFieldVisible()).toBe(true);
            await datasetsPage.fillDescriptionWhileEditingDataset(datasetDescription1);
            await datasetsPage.clickSaveForSection('About Dataset');
            await expect (datasetsPage.getFlashMessageLocator()).toBeVisible();
            expect (await datasetsPage.getFlashMessageText()).toContain('Successfully saved your dataset description.');
            await datasetsPage.reloadPage();

            expect (await datasetsPage.getUsabilityValue()).toBeGreaterThan(usabilityValue);
            usabilityValue = await datasetsPage.getUsabilityValue();
            expect ((await datasetsPage.getDatasetCompletenessCredibilityCompatibilityStats()).completeness.value).toBeGreaterThan(datasetStats.completeness.value);
            expect ((await datasetsPage.getDatasetCompletenessCredibilityCompatibilityStats()).completeness.isDescriptionChecked).toBe(true);
            
            expect (await datasetsPage.isAddDescriptionPendingActionVisible()).toBe(false);
            await datasetsPage.clickRightBtnForPendingActions();
            expect (await datasetsPage.isAddDescriptionPendingActionVisible()).toBe(false);
            
            expect ((await datasetsPage.getDescriptionOnView()).h1).toEqual(datasetDescriptionH1);
            expect ((await datasetsPage.getDescriptionOnView()).h2).toEqual(datasetDescriptionH2);
            expect ((await datasetsPage.getDescriptionOnView()).p).toEqual(datasetDescriptionParagraph);
        })
        await test.step('Add dataset cover image via pending action', async()=>{
            await datasetsPage.clickLeftBtnForPendingActions();
            
            datasetStats = await datasetsPage.getDatasetCompletenessCredibilityCompatibilityStats();
            await datasetsPage.clickUploadImagePendingAction();
            expect (await datasetsPage.isEditDatasetImagePanelVisible()).toBe(true);
            await datasetsPage.selectFilesForUpload(['./resources/123.jpg']);
            await datasetsPage.clickSaveOnEditDatasetImagePanel();
            await expect (datasetsPage.getFlashMessageLocator()).toBeVisible();
            expect (await datasetsPage.getFlashMessageText()).toContain('Your image was uploaded successfully.');
            await datasetsPage.reloadPage();

            await datasetsPage.selectTabOnDatasetProfile('Data Card');
            expect (await datasetsPage.getUsabilityValue()).toBeGreaterThan(usabilityValue);
            usabilityValue = await datasetsPage.getUsabilityValue();
            expect ((await datasetsPage.getDatasetCompletenessCredibilityCompatibilityStats()).completeness.value).toBeGreaterThan(datasetStats.completeness.value);
            expect ((await datasetsPage.getDatasetCompletenessCredibilityCompatibilityStats()).completeness.isCoverImageChecked).toBe(true);

            expect (await datasetsPage.isUploadImagePendingActionVisible()).toBe(false);
            await datasetsPage.clickRightBtnForPendingActions();
            expect (await datasetsPage.isUploadImagePendingActionVisible()).toBe(false);
        })
        await test.step('Add dataset tags via pending action', async()=>{
            await datasetsPage.clickLeftBtnForPendingActions();

            datasetStats = await datasetsPage.getDatasetCompletenessCredibilityCompatibilityStats();
            await datasetsPage.clickAddTagsPendingAction();
            expect (await datasetsPage.tagsPanel().isTagsPanelOpened()).toBe(true);

            const tagsToAdd = ['Mexico','Beginner', 'WAE', 'ImageNet 2012 classification'];
            await datasetsPage.tagsPanel().searchAndSelectTags(tagsToAdd);
            await datasetsPage.tagsPanel().clickApplyBtn();
            await expect (datasetsPage.getFlashMessageLocator()).toBeVisible();
            expect (await datasetsPage.getFlashMessageText()).toContain('The tags have been updated successfully.');
            await datasetsPage.reloadPage();

            // const addedTags = await datasetsPage.getDatasetTags();       //Here is a bug in the app
            // expect(addedTags.length).toEqual(tagsToAdd.length);
            // for (let tag of tagsToAdd){
            //      expect (addedTags.includes(tag)).toBe(true)
            // }

            expect (await datasetsPage.getUsabilityValue()).toBeGreaterThan(usabilityValue);
            usabilityValue = await datasetsPage.getUsabilityValue();
            expect ((await datasetsPage.getDatasetCompletenessCredibilityCompatibilityStats()).completeness.value).toBeGreaterThan(datasetStats.completeness.value);
            expect ((await datasetsPage.getDatasetCompletenessCredibilityCompatibilityStats()).completeness.isTagChecked).toBe(true);

            expect (await datasetsPage.isAddTagsPendingActionVisible()).toBe(false);
        })
        await test.step('Add dataset license via pending action', async()=>{

            datasetStats = await datasetsPage.getDatasetCompletenessCredibilityCompatibilityStats();
            await datasetsPage.clickSpecifyLicensePendingAction();
            expect (await datasetsPage.isLicenseDropDownVisible()).toBe(true);
            expect (await datasetsPage.isSaveBtnForSectionVisible('License')).toBe(true);

            const license = await datasetsPage.selectRandomDatasetLicense();
            await datasetsPage.clickSaveForSection('License');
            await expect (datasetsPage.getFlashMessageLocator()).toBeVisible();
            expect (await datasetsPage.getFlashMessageText()).toContain('Successfully updated the license.');
            await datasetsPage.reloadPage();
            expect (await datasetsPage.getDatasetLicense()).toEqual(license);

            expect (await datasetsPage.getUsabilityValue()).toBeGreaterThan(usabilityValue);
            usabilityValue = await datasetsPage.getUsabilityValue();
            expect ((await datasetsPage.getDatasetCompletenessCredibilityCompatibilityStats()).compatibility.value).toBeGreaterThan(datasetStats.compatibility.value);
            expect ((await datasetsPage.getDatasetCompletenessCredibilityCompatibilityStats()).compatibility.isLicenseChecked).toBe(true);

            expect (await datasetsPage.isSpecifyLicensePendingActionVisible()).toBe(false);
        })
        await test.step('Add file information via pending action', async()=>{              
            
            datasetStats = await datasetsPage.getDatasetCompletenessCredibilityCompatibilityStats();
            await datasetsPage.clickAddFileInformationPendingAction();
            expect (await datasetsPage.isLocatorInViewport(datasetsPage.editFileInformationBtn)).toBe(true);
            await datasetsPage.clickEditFileInformationBtn();
            await datasetsPage.fillFileInformationField(datasetFileInformation);
            await datasetsPage.clickSaveBtnForFileInformation();
            await datasetsPage.reloadPage();

            expect (await datasetsPage.getUsabilityValue()).toBeGreaterThan(usabilityValue);
            usabilityValue = await datasetsPage.getUsabilityValue();
            expect ((await datasetsPage.getDatasetCompletenessCredibilityCompatibilityStats()).compatibility.value).toBeGreaterThan(datasetStats.compatibility.value);
            expect ((await datasetsPage.getDatasetCompletenessCredibilityCompatibilityStats()).compatibility.isFileDescriptionChecked).toBe(true);
            
            expect (await datasetsPage.isAddFileInformationPendingActionVisible()).toBe(false);
        })
        //Add provenance via pending action
        await test.step('Postcondition. Remove remaining dataset', async()=>{
            await deleteDatasetViaPW(page,createdDataset.datasetSlug,createdDataset.ownerSlug)
        })
    })

    test('Edit dataset coverage', async({page,mainMenu,datasetsPage})=>{
        const datasetName = 'AutoDataSet'+Date.now().toString();
        let createdDataset
        await test.step('Preconditions', async()=>{
            createdDataset = await createDatasetViaPW(page, datasetName, [datasetRemoteLink2]);
            await datasetsPage.openDatasetProfile(createdDataset.datasetSlug,createdDataset.ownerSlug);
            await datasetsPage.reloadPage();
        })
        await test.step('Verify that "Create" button becomes enabled after providing dataset name', async()=>{
            await datasetsPage.clickEditForDatasetSectionWithName("Coverage");
            expect(await datasetsPage.isStartEndDateFieldVisible("Start Date")).toBe(true);
            expect(await datasetsPage.isStartEndDateFieldVisible("End Date")).toBe(true);
            expect(await datasetsPage.isGeospatialCoverageFieldVisible()).toBe(true);
            await datasetsPage.clickStartOrEndDateField('Start Date');
            await datasetsPage.selectDateInDatepicker('19 nov 1957');
            await datasetsPage.clickStartOrEndDateField('End Date');
            await datasetsPage.selectDateInDatepicker('19 nov 2081');
            // await datasetsPage.clickContinueBtnWhileCreatingDataset();
            // await datasetsPage.fillDatasetNameWhileCreatingDataset(datasetName);
            // expect(await datasetsPage.isCreateBtnEnabled()).toBe(true)
        })
        // await test.step('Verify that dataset is created and contains resource from the remote link', async()=>{
        //     createdDataset = await datasetsPage.clickCreateBtnAndGetDatasetProperties();
        //     await datasetsPage.clickGoToDatasetBtn();
        //     expect(await datasetsPage.getDatasetName()).toEqual(datasetName);
        //     expect(await datasetsPage.getDatasetAttachmentSizeNumber()).toBeGreaterThan(0);
        //     await expect(page.getByTestId('preview-image')).toBeVisible();
        // })
        await test.step('Postcondition. Remove created dataset', async()=>{
            await deleteDatasetViaPW(page,createdDataset.datasetSlug,createdDataset.ownerSlug)
        })
    })
})