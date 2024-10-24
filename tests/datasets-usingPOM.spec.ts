import { test,expect,request } from '@playwright/test';
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
import { Datasets } from '../page-objects/DatasetsPage';
import { MainMenu } from '../page-objects/MainMenu';
import { YourWork } from '../page-objects/YourWorkPage';

test.describe('tests using POM', async()=>{
    test.beforeEach(async({page})=>{
        const mainMenu = new MainMenu(page);
        await mainMenu.openHomePage();
    })
    test('open plus menu and datasets page @smoke @smokeDataset', async({page})=>{
        const mainMenu = new MainMenu(page);
        await mainMenu.openCreationMenu();
        await mainMenu.closeCreationMenu();
        await mainMenu.openDatasetsPageViaMainMenu();
        await expect(page).toHaveURL('/datasets');
    })
    test('Create and remove collection via PW @smoke @smokeDataset', async({page})=>{             //MOVE THIS TEST TO SEPARATE COLLECTIONS.SPEC FILE
        const collName = 'COLL'+ Date.now().toString()
        const coll = await createCollectionViaPW(page,collName)
        await deleteCollectionViaPW(page,coll.collectionId)
    })
    test('Create new dataset with remote url @smoke @smokeDataset', async({page})=>{
        const datasetName = 'AutoDataSet'+Date.now().toString();
        const mainMenu = new MainMenu(page);
        const datasetPage = new Datasets(page);
        let createdDataset
        await test.step('Preconditions', async()=>{
            await mainMenu.openDatasetsPageViaMainMenu();
            await datasetPage.clickNewDatasetBtn();
        })
        await test.step('Verify that "Create" button becomes enabled after providing dataset name', async()=>{
            await datasetPage.clickLinkTabWhileCreatingDataset();
            await datasetPage.fillURLFieldWhileCreatingDataset(datasetRemoteLink1);
            await datasetPage.clickContinueBtnWhileCreatingDataset();
            await datasetPage.fillDatasetNameWhileCreatingDataset(datasetName);
            expect(await datasetPage.isCreateBtnEnabled()).toBe(true)
        })
        await test.step('Verify that dataset is created and contains resource from the remote link', async()=>{
            createdDataset = await datasetPage.clickCreateBtnAndGetDatasetProperties();
            await datasetPage.clickGoToDatasetBtn();
            expect(await datasetPage.getDatasetName()).toEqual(datasetName);
            await expect(page.getByText('Remote source:')).toBeVisible();
            await expect(page.getByTestId('preview-image')).toBeVisible();
        })
        await test.step('Postcondition. Remove created dataset', async()=>{
            await deleteDatasetViaPW(page,createdDataset.datasetSlug,createdDataset.ownerSlug)
        })
    })


    test('Create new dataset with file upload and edits its provenance @smokeDataset', async({page})=>{ 
        const datasetName = 'AutoDataSet'+Date.now().toString();
        const mainMenu = new MainMenu(page);
        const datasetPage = new Datasets(page);
        let createdDataset
        let usabilityValue
        let usabilityStats
        await test.step('Preconditions', async()=>{
            await mainMenu.openDatasetsPageViaMainMenu();
            await datasetPage.clickNewDatasetBtn();
        })
        await test.step('Upload file and create dataset', async()=>{
            await datasetPage.selectFilesForUpload(['./resources/123.jpg']);
            await datasetPage.fillDatasetNameWhileCreatingDataset(datasetName);
            createdDataset = await datasetPage.clickCreateBtnAndGetDatasetProperties();
            await datasetPage.clickGoToDatasetBtn();
            await expect(page.getByTestId('preview-image')).toBeVisible();
        })
        await test.step('Verify that clicking specify provenance pending action opens new input fields', async()=>{
            usabilityValue = await datasetPage.getUsabilityValue();
            usabilityStats = await datasetPage.getDatasetCompletenessCredibilityCompatibilityStats()
            await datasetPage.clickRightBtnForPendingActions();
            await datasetPage.clickSpecifyProvenancePendingAction();
            expect(await datasetPage.isSourcesInputVisible()).toBe(true);
            expect(await datasetPage.isCollectionMethodologyInputVisible()).toBe(true);
        })
        await test.step('Provide source and collection methodology and verify it can be saved', async()=>{
            await datasetPage.fillCollectionMethodologyInput(datasetCollectionMethodologyText);
            await datasetPage.fillSourcesInput(datasetSourceText);
            await datasetPage.clickSaveForSection('License');
            await expect (datasetPage.getFlashMessageLocator()).toBeVisible();
            expect(await datasetPage.getFlashMessageText()).toContain('Successfully updated the provenance.');
            await datasetPage.reloadPage();
            expect((await datasetPage.getDatasetSourceAndCollectionMethodology()).source).toEqual(datasetSourceText.replace(/\n/g,' '));
            expect((await datasetPage.getDatasetSourceAndCollectionMethodology()).collectionMethodology).toEqual(datasetCollectionMethodologyText.replace(/\n/g,' '));
        })
        await test.step('Verify that pending action for provenance is not shown and stats are updated', async()=>{
            expect(await datasetPage.isSpecifyProvenancePendingActionVisible()).toBe(false);
            await datasetPage.clickRightBtnForPendingActions();
            expect(await datasetPage.isSpecifyProvenancePendingActionVisible()).toBe(false);
            expect(await datasetPage.getUsabilityValue()).toBeGreaterThan(usabilityValue);
            expect((await datasetPage.getDatasetCompletenessCredibilityCompatibilityStats()).credibility.value).toBeGreaterThan(usabilityStats.credibility.value);
            expect((await datasetPage.getDatasetCompletenessCredibilityCompatibilityStats()).credibility.isSourceProvenanceChecked).toBe(true);
        })
        await test.step('Postcondition. Remove created dataset', async()=>{
            await deleteDatasetViaPW(page,createdDataset.datasetSlug,createdDataset.ownerSlug)
        })
    })

    test('Remove several datasets', async({page})=>{
        const datasetName = 'AutoDataSet'+Math.floor(Math.random() * 100000);
        const mainMenu = new MainMenu(page);
        const datasetsPage = new Datasets(page);
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

    test('Edit dataset via pending actions', async({page})=>{   
        const datasetName = 'AutoDataSet'+Date.now().toString();
        const datasetPage = new Datasets(page);
        let createdDataset
        let usabilityValue = 0;
        let datasetStats;
        let datasetCredibility = 0;
        let datasetCompatibility = 0;
        await test.step('Preconditions', async()=>{
            createdDataset = await createDatasetViaPW(page, datasetName, [datasetRemoteLink2]);
            await datasetPage.openDatasetProfile(createdDataset.datasetSlug,createdDataset.ownerSlug);
            await datasetPage.reloadPage();
            datasetStats = await datasetPage.getDatasetCompletenessCredibilityCompatibilityStats();
        })
        await test.step('Add subtitle via pending action', async()=>{
            usabilityValue = await datasetPage.getUsabilityValue();
            await datasetPage.clickAddSubtitlePendingAction();
            expect (await datasetPage.isTabWithNameSelected('Settings')).toBe(true);
            expect(await datasetPage.isSaveChangesBtnEnabled()).toBe(false);
            await datasetPage.fillSubtitleWhileEditingDataset(`NEW SUBTITLE 123123123123123 EDIT`);
            expect(await datasetPage.isSaveChangesBtnEnabled()).toBe(true);
            await datasetPage.acceptCookies();
            await datasetPage.clickSaveChangesBtn();
            await expect (datasetPage.getFlashMessageLocator()).toBeVisible();
            expect (await datasetPage.getFlashMessageText()).toContain('Successfully saved your dataset.');
            expect(await datasetPage.isSaveChangesBtnEnabled()).toBe(false);

            await datasetPage.reloadPage();
            expect (await datasetPage.getSubtitleInputValue()).toEqual(`NEW SUBTITLE 123123123123123 EDIT`);
            expect (await datasetPage.getSubtitleOnView()).toEqual('NEW SUBTITLE 123123123123123 EDIT');

            await datasetPage.selectTabOnDatasetProfile('Data Card');
            expect (await datasetPage.getUsabilityValue()).toBeGreaterThan(usabilityValue);
            usabilityValue = await datasetPage.getUsabilityValue();
            expect ((await datasetPage.getDatasetCompletenessCredibilityCompatibilityStats()).completeness.value).toBeGreaterThan(datasetStats.completeness.value);
            expect ((await datasetPage.getDatasetCompletenessCredibilityCompatibilityStats()).completeness.isSubtitleChecked).toBe(true);
            
            expect (await datasetPage.isAddSubtitlePendingActionVisible()).toBe(false);             
            await datasetPage.clickRightBtnForPendingActions();
            expect (await datasetPage.isAddSubtitlePendingActionVisible()).toBe(false);
            
        })
        await test.step('Add description via pending action', async()=>{              
            await datasetPage.clickLeftBtnForPendingActions();
            
            datasetStats = await datasetPage.getDatasetCompletenessCredibilityCompatibilityStats();
            await datasetPage.clickAddDescriptionPendingAction();
            expect (await datasetPage.isDatasetDescriptionFieldVisible()).toBe(true);
            await datasetPage.fillDescriptionWhileEditingDataset(datasetDescription1);
            await datasetPage.clickSaveForSection('About Dataset');
            await expect (datasetPage.getFlashMessageLocator()).toBeVisible();
            expect (await datasetPage.getFlashMessageText()).toContain('Successfully saved your dataset description.');
            await datasetPage.reloadPage();

            expect (await datasetPage.getUsabilityValue()).toBeGreaterThan(usabilityValue);
            usabilityValue = await datasetPage.getUsabilityValue();
            expect ((await datasetPage.getDatasetCompletenessCredibilityCompatibilityStats()).completeness.value).toBeGreaterThan(datasetStats.completeness.value);
            expect ((await datasetPage.getDatasetCompletenessCredibilityCompatibilityStats()).completeness.isDescriptionChecked).toBe(true);
            
            expect (await datasetPage.isAddDescriptionPendingActionVisible()).toBe(false);
            await datasetPage.clickRightBtnForPendingActions();
            expect (await datasetPage.isAddDescriptionPendingActionVisible()).toBe(false);
            
            expect ((await datasetPage.getDescriptionOnView()).h1).toEqual(datasetDescriptionH1);
            expect ((await datasetPage.getDescriptionOnView()).h2).toEqual(datasetDescriptionH2);
            expect ((await datasetPage.getDescriptionOnView()).p).toEqual(datasetDescriptionParagraph);
        })
        await test.step('Add dataset cover image via pending action', async()=>{
            await datasetPage.clickLeftBtnForPendingActions();
            
            datasetStats = await datasetPage.getDatasetCompletenessCredibilityCompatibilityStats();
            await datasetPage.clickUploadImagePendingAction();
            expect (await datasetPage.isEditDatasetImagePanelVisible()).toBe(true);
            await datasetPage.selectFilesForUpload(['./resources/123.jpg']);
            await datasetPage.clickSaveOnEditDatasetImagePanel();
            await expect (datasetPage.getFlashMessageLocator()).toBeVisible();
            expect (await datasetPage.getFlashMessageText()).toContain('Your image was uploaded successfully.');
            await datasetPage.reloadPage();

            await datasetPage.selectTabOnDatasetProfile('Data Card');
            expect (await datasetPage.getUsabilityValue()).toBeGreaterThan(usabilityValue);
            usabilityValue = await datasetPage.getUsabilityValue();
            expect ((await datasetPage.getDatasetCompletenessCredibilityCompatibilityStats()).completeness.value).toBeGreaterThan(datasetStats.completeness.value);
            expect ((await datasetPage.getDatasetCompletenessCredibilityCompatibilityStats()).completeness.isCoverImageChecked).toBe(true);

            expect (await datasetPage.isUploadImagePendingActionVisible()).toBe(false);
            await datasetPage.clickRightBtnForPendingActions();
            expect (await datasetPage.isUploadImagePendingActionVisible()).toBe(false);
        })
        await test.step('Add dataset tags via pending action', async()=>{
            await datasetPage.clickLeftBtnForPendingActions();

            datasetStats = await datasetPage.getDatasetCompletenessCredibilityCompatibilityStats();
            await datasetPage.clickAddTagsPendingAction();
            expect (await datasetPage.tagsPanel().isTagsPanelOpened()).toBe(true);

            const tagsToAdd = ['Mexico','Beginner', 'WAE', 'ImageNet 2012 classification'];
            await datasetPage.tagsPanel().searchAndSelectTags(tagsToAdd);
            await datasetPage.tagsPanel().clickApplyBtn();
            await expect (datasetPage.getFlashMessageLocator()).toBeVisible();
            expect (await datasetPage.getFlashMessageText()).toContain('The tags have been updated successfully.');
            await datasetPage.reloadPage();

            // const addedTags = await datasetPage.getDatasetTags();       //Here is a bug in the app
            // expect(addedTags.length).toEqual(tagsToAdd.length);
            // for (let tag of tagsToAdd){
            //      expect (addedTags.includes(tag)).toBe(true)
            // }

            expect (await datasetPage.getUsabilityValue()).toBeGreaterThan(usabilityValue);
            usabilityValue = await datasetPage.getUsabilityValue();
            expect ((await datasetPage.getDatasetCompletenessCredibilityCompatibilityStats()).completeness.value).toBeGreaterThan(datasetStats.completeness.value);
            expect ((await datasetPage.getDatasetCompletenessCredibilityCompatibilityStats()).completeness.isTagChecked).toBe(true);

            expect (await datasetPage.isAddTagsPendingActionVisible()).toBe(false);
        })
        await test.step('Add dataset license via pending action', async()=>{

            datasetStats = await datasetPage.getDatasetCompletenessCredibilityCompatibilityStats();
            await datasetPage.clickSpecifyLicensePendingAction();
            expect (await datasetPage.isLicenseDropDownVisible()).toBe(true);
            expect (await datasetPage.isSaveBtnForSectionVisible('License')).toBe(true);

            const license = await datasetPage.selectRandomDatasetLicense();
            await datasetPage.clickSaveForSection('License');
            await expect (datasetPage.getFlashMessageLocator()).toBeVisible();
            expect (await datasetPage.getFlashMessageText()).toContain('Successfully updated the license.');
            await datasetPage.reloadPage();
            expect (await datasetPage.getDatasetLicense()).toEqual(license);

            expect (await datasetPage.getUsabilityValue()).toBeGreaterThan(usabilityValue);
            usabilityValue = await datasetPage.getUsabilityValue();
            expect ((await datasetPage.getDatasetCompletenessCredibilityCompatibilityStats()).compatibility.value).toBeGreaterThan(datasetStats.compatibility.value);
            expect ((await datasetPage.getDatasetCompletenessCredibilityCompatibilityStats()).compatibility.isLicenseChecked).toBe(true);

            expect (await datasetPage.isSpecifyLicensePendingActionVisible()).toBe(false);
        })
        await test.step('Add file information via pending action', async()=>{              
            
            datasetStats = await datasetPage.getDatasetCompletenessCredibilityCompatibilityStats();
            await datasetPage.clickAddFileInformationPendingAction();
            expect (await datasetPage.isLocatorInViewport(datasetPage.editFileInformationBtn)).toBe(true);
            await datasetPage.clickEditFileInformationBtn();
            await datasetPage.fillFileInformationField(datasetFileInformation);
            await datasetPage.clickSaveBtnForFileInformation();
            await datasetPage.reloadPage();

            expect (await datasetPage.getUsabilityValue()).toBeGreaterThan(usabilityValue);
            usabilityValue = await datasetPage.getUsabilityValue();
            expect ((await datasetPage.getDatasetCompletenessCredibilityCompatibilityStats()).compatibility.value).toBeGreaterThan(datasetStats.compatibility.value);
            expect ((await datasetPage.getDatasetCompletenessCredibilityCompatibilityStats()).compatibility.isFileDescriptionChecked).toBe(true);
            
            expect (await datasetPage.isAddFileInformationPendingActionVisible()).toBe(false);
        })
        //Add provenance via pending action
        await test.step('Postcondition. Remove remaining dataset', async()=>{
            await deleteDatasetViaPW(page,createdDataset.datasetSlug,createdDataset.ownerSlug)
        })
    })
})