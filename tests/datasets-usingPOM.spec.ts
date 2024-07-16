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
        await mainMenu.openDatasetsPage();
        const datasetPage = new Datasets(page);
        await datasetPage.clickNewDatasetBtn();
        await datasetPage.clickLinkTabWhileCreatingDataset();
        await datasetPage.fillURLFieldWhileCreatingDataset(datasetRemoteLink1);
        await datasetPage.clickContinueBtnWhileCreatingDataset();
        await datasetPage.fillDatasetNameWhileCreatingDataset(datasetName);
        const createdDataset = await datasetPage.clickCreateBtnAndGetDatasetProperties();
        await datasetPage.clickGoToDatasetBtn();
        expect(await datasetPage.getDatasetName()).toEqual(datasetName);
        await expect(page.getByText('Remote source:')).toBeVisible();
        await expect(page.getByTestId('preview-image')).toBeVisible();
        //post-condition
        await deleteDatasetViaPW(page,createdDataset.datasetSlug,createdDataset.ownerSlug)
    })
    test('Create new dataset with file upload', async({page})=>{
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
    test('Remove several datasets', async({page,request})=>{
        const datasetName = 'AutoDataSet'+Math.floor(Math.random() * 100000);
        const mainMenu = new MainMenu(page);
        const datasetsPage = new Datasets(page);
        const yourWorkPage = new YourWork(page);
        const datasetNames = ['1'+datasetName,'2'+datasetName,'3'+datasetName,'4'+datasetName,'5'+datasetName]
        let checkedItems
        await test.step('Preconditions', async()=>{
            await createDatasetViaPW(page, datasetNames[0],[datasetRemoteLink1,datasetRemoteLink2]);
            await createDatasetViaPW(page, datasetNames[1],[datasetRemoteLink2]);
            await createDatasetViaPW(page, datasetNames[2],[datasetRemoteLink1])
            await createDatasetViaPW(page, datasetNames[3],[datasetRemoteLink1])
        })
        await test.step('Verify that checkboxes for needed datasets are checked', async()=>{
            await mainMenu.openDatasetsPage();
            await datasetsPage.openYourWork();
            checkedItems = await yourWorkPage.checkAllItemsContainingNameAndReturnTheirNames('AutoDataSet');
            expect(checkedItems.length).toEqual(4)
        })
        await test.step('Verify that just checked items are shown on the panel before removal', async()=>{
            const trueCheckedItems = await yourWorkPage.getCheckedItemsNames();
            await yourWorkPage.clickDeleteBtn();
            expect(await yourWorkPage.getCountOfItemsOnDeleteWarningPanel()).toEqual(4); //add here some automatic calculations based on precs
            const itemsOnPanel = await yourWorkPage.getNamesOfItemsOnDeleteWarningPanel();
            expect(trueCheckedItems.length).toEqual(itemsOnPanel.length);
            for (let item of itemsOnPanel){
                expect(trueCheckedItems.includes(item)).toBe(true)
            }
        })
        await test.step('Verify that items to remove can be edited', async()=>{
            await yourWorkPage.clickCancelBtnOnConfirmDialog();
            let trueCheckedItems = await yourWorkPage.getCheckedItemsNames();
            expect(trueCheckedItems.length).toEqual(4);
            const uncheckedItems = await yourWorkPage.uncheckItemsWithProvidedNamesAndReturnTheirNames([datasetNames[1]]);
            trueCheckedItems = await yourWorkPage.getCheckedItemsNames();
            for (let uncheckedName of uncheckedItems){
                expect(trueCheckedItems.includes(uncheckedName)).toBe(false) 
            }
            await yourWorkPage.clickDeleteBtn();
            expect(await yourWorkPage.getCountOfItemsOnDeleteWarningPanel()).toEqual(3); //add here some automatic calculations based on precs
            const itemsOnPanel = await yourWorkPage.getNamesOfItemsOnDeleteWarningPanel();
            expect(trueCheckedItems.length).toEqual(itemsOnPanel.length);
            for (let item of itemsOnPanel){
                expect(trueCheckedItems.includes(item)).toBe(true)
            }
            // add method to check items containing exact values from a given array of strings. And then add additional check here with selecting an additional item to delete
        })
        

        //steps
        // await page.waitForTimeout(3000);
        // await mainMenu.openDatasetsPage();
        // await datasetsPage.openYourWork();
        // await page.waitForTimeout(1000);
        // await page.reload();
        // await datasetsPage.deleteDatasetsContainingName('AutoDataSet');
        // await expect(datasetsPage.flashMessage).toBeVisible();
        // expect(await datasetsPage.getFlashMessageText()).toContain('items deleted');
        // await page.reload();
        // expect(page.locator('#site-content [role="listitem"]').getByText('AutoDataSet')).toBeHidden();
    })
})