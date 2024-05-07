import { test,expect } from '@playwright/test';
import { PageManager } from '../page-objects/PageManager';

test.describe('tests using POM', async()=>{
    test.beforeEach(async({page})=>{
        await page.goto('/')
    })
    test('open plus menu and datasets page', async({page})=>{
        const pm = new PageManager(page);
        await pm.navigateTo().openHomePage();
        await pm.navigateTo().openCreationMenu();
        await pm.navigateTo().closeCreationMenu();
        await pm.navigateTo().openDatasetsPage()
    })
    test.only('Create new dataset with', async({page})=>{
        const datasetName = 'AutoDataSet'+Math.floor(Math.random() * 100000);
        const pm = new PageManager(page);
        await pm.navigateTo().openDatasetsPage();
        await pm.onDatasetsPage().addDatasetUsingRemoteLink(datasetName,'https://balka-book.com/files/2023/07_18/12_14/u_files_store_21_11.jpg');
        await expect(page.getByTestId('dataset-detail-render-tid').locator('h1')).toHaveText(datasetName);
        await expect(page.getByText('Remote source:')).toBeVisible();
        await expect(page.getByTestId('preview-image')).toBeVisible();
        await pm.onDatasetsPage().deleteDatasetFromItsPage()

        await pm.navigateTo().openDatasetsPage();
        await pm.onDatasetsPage().addDatasetUsingFileUpload(datasetName+' upload');
        await expect(page.getByTestId('dataset-detail-render-tid').locator('h1')).toHaveText(datasetName+' upload');
        await expect(page.getByTestId('preview-image')).toBeVisible();
        await pm.onDatasetsPage().deleteDatasetFromItsPage()
        
        await pm.navigateTo().openDatasetsPage();
        await pm.onDatasetsPage().openYourWork();
        await page.reload();
        expect(page.getByText(datasetName)).toBeHidden();
        expect(page.getByText(datasetName+' upload')).toBeHidden();

        // await pm.onDatasetsPage().deleteDatasetsContainingName('33');
        // await page.pause()
    })
})