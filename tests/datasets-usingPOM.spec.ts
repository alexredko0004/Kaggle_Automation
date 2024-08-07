import { test,expect,request } from '@playwright/test';
import { deleteDatasetViaPW, createDatasetViaPW } from '../precs/Datasets/datasetPrecs';
import { datasetRemoteLink1,datasetRemoteLink2 } from '../helpers/constants';
import { Datasets } from '../page-objects/DatasetsPage';
import { MainMenu } from '../page-objects/MainMenu';
import { YourWork } from '../page-objects/YourWorkPage';

test.describe('tests using POM', async()=>{
    test.beforeEach(async({page})=>{
        await page.goto('/');
    })
    test('open plus menu and datasets page @smoke', async({page})=>{
        const mainMenu = new MainMenu(page);
        await mainMenu.openHomePage();
        await mainMenu.openCreationMenu();
        await mainMenu.closeCreationMenu();
        await mainMenu.openDatasetsPage()
    })
    test('Create new dataset with remote url', async({page})=>{
        const datasetName = 'AutoDataSet'+Date.now().toString();
        const mainMenu = new MainMenu(page);
        const datasetPage = new Datasets(page);
        let createdDataset
        await test.step('Preconditions', async()=>{
            await mainMenu.openDatasetsPage();
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


    test('Create new dataset with file upload', async({page})=>{   //REWRITE THIS TEST WITH MODULAR METHODS
        const datasetName = 'AutoDataSet'+Math.floor(Math.random() * 100000);
        const mainMenu = new MainMenu(page);
        const datasetPage = new Datasets(page);
        await test.step('Add dataset', async()=>{
            await mainMenu.openDatasetsPage();
            await datasetPage.addDatasetUsingFileUpload(datasetName+' upload');
            await expect(page.getByTestId('dataset-detail-render-tid').locator('h1')).toHaveText(datasetName+' upload');
            await expect(page.getByTestId('preview-image')).toBeVisible();
        })
        await test.step('Postcondition. Remove created dataset', async()=>{
            await datasetPage.deleteDatasetFromItsPage()
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
            await mainMenu.openDatasetsPage();
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
            await deleteDatasetViaPW(page,remainingDataset1.datasetVersionReference.slug,remainingDataset1.datasetVersionReference.ownerSlug)
            await deleteDatasetViaPW(page,remainingDataset2.datasetVersionReference.slug,remainingDataset2.datasetVersionReference.ownerSlug)
        })
    })

    test('Edit dataset', async({page})=>{   //CRESTE TEST WITH PENDING ACTIONS INTERACTIONS
        const datasetName = 'AutoDataSet'+Math.floor(Math.random() * 100000);
        const mainMenu = new MainMenu(page);
        const datasetPage = new Datasets(page);
        await test.step('Add dataset', async()=>{
            await mainMenu.openDatasetsPage();
            await datasetPage.addDatasetUsingFileUpload(datasetName+' upload');
            await expect(page.getByTestId('dataset-detail-render-tid').locator('h1')).toHaveText(datasetName+' upload');
            await expect(page.getByTestId('preview-image')).toBeVisible();
        })
        await test.step('Postcondition. Remove created dataset', async()=>{
            await datasetPage.deleteDatasetFromItsPage()
        })
    })
})