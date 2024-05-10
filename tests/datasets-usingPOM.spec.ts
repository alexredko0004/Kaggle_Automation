import { test,expect } from '@playwright/test';
import { createDataset } from '../precs/datasetPrecs';
import { Dataset } from '../page-objects/Dataset';
import { MainMenu } from '../page-objects/MainMenu';

test.describe('tests using POM', async()=>{
    test.beforeEach(async({page})=>{
        await page.goto('/');
    })
    test.skip('open plus menu and datasets page', async({page})=>{
        const mainMenu = new MainMenu(page);
        await mainMenu.openHomePage();
        await mainMenu.openCreationMenu();
        await mainMenu.closeCreationMenu();
        await mainMenu.openDatasetsPage()
    })
    test.skip('Create new dataset with remote url', async({page})=>{
        const datasetName = 'AutoDataSet'+Math.floor(Math.random() * 100000);
        const mainMenu = new MainMenu(page);
        await mainMenu.openDatasetsPage();
        const datasetPage = new Dataset(page);
        await datasetPage.addDatasetUsingRemoteLink(datasetName,'https://balka-book.com/files/2023/07_18/12_14/u_files_store_21_11.jpg');
        await expect(page.getByTestId('dataset-detail-render-tid').locator('h1')).toHaveText(datasetName);
        await expect(page.getByText('Remote source:')).toBeVisible();
        await expect(page.getByTestId('preview-image')).toBeVisible();
        //post-condition
        await datasetPage.deleteDatasetFromItsPage()
    })
    test.skip('Create new dataset with file upload', async({page})=>{
        const datasetName = 'AutoDataSet'+Math.floor(Math.random() * 100000);
        const mainMenu = new MainMenu(page);
        await mainMenu.openDatasetsPage();
        const datasetPage = new Dataset(page);
        await datasetPage.addDatasetUsingFileUpload(datasetName+' upload');
        await expect(page.getByTestId('dataset-detail-render-tid').locator('h1')).toHaveText(datasetName+' upload');
        await expect(page.getByTestId('preview-image')).toBeVisible();
        //post-condition
        await datasetPage.deleteDatasetFromItsPage()
    })
    test('Remove several datasets', async({page})=>{
        const datasetName = 'AutoDataSet'+Math.floor(Math.random() * 100000);
        test.step('preconditions',async()=>{
            await createDataset(datasetName,'https://petapixel.com/assets/uploads/2022/06/what-is-a-jpeg-featured.jpg');
            await createDataset(datasetName+'AA','https://petapixel.com/assets/uploads/2022/06/what-is-a-jpeg-featured.jpg');
            await createDataset('AA'+datasetName,'https://balka-book.com/files/2023/07_18/12_14/u_files_store_21_11.jpg')
        })
        const mainMenu = new MainMenu(page);
        const datasetPage = new Dataset(page);
        //await pm.navigateTo().openDatasetsPage();
        //preconditions
        
        // await pm.onDatasetsPage().addDatasetUsingFileUpload(datasetName+' upload1');
        // await pm.navigateTo().openDatasetsPage();
        // await pm.onDatasetsPage().addDatasetUsingFileUpload(datasetName+' upload2');
        

        //steps
        await mainMenu.openDatasetsPage();
        // const dataset = new Dataset(page);
        // await dataset.openYourWork();
        await datasetPage.openYourWork();
        await page.waitForTimeout(10000);
        await page.reload();
        // await page.waitForTimeout(2000);
        // await page.reload();
        await datasetPage.deleteDatasetsContainingName('AutoDataSet');
        await page.reload();
        expect(page.locator('#site-content [role="listitem"]').getByText('AutoDataSet')).toBeHidden();
    })
})