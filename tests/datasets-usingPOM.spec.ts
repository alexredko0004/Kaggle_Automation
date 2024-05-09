import { test,expect } from '@playwright/test';
import { PageManager } from '../page-objects/PageManager';
import { createDatasetViaAPI } from '../precs/datasetPrecs';

test.describe('tests using POM', async()=>{
    test.beforeEach(async({page})=>{
        await page.goto('/');
    })
    test.skip('open plus menu and datasets page', async({page})=>{
        const pm = new PageManager(page);
        await pm.navigateTo().openHomePage();
        await pm.navigateTo().openCreationMenu();
        await pm.navigateTo().closeCreationMenu();
        await pm.navigateTo().openDatasetsPage()
    })
    test.skip('Create new dataset with remote url', async({page})=>{
        const datasetName = 'AutoDataSet'+Math.floor(Math.random() * 100000);
        const pm = new PageManager(page);
        await pm.navigateTo().openDatasetsPage();
        await pm.onDatasetsPage().addDatasetUsingRemoteLink(datasetName,'https://balka-book.com/files/2023/07_18/12_14/u_files_store_21_11.jpg');
        await expect(page.getByTestId('dataset-detail-render-tid').locator('h1')).toHaveText(datasetName);
        await expect(page.getByText('Remote source:')).toBeVisible();
        await expect(page.getByTestId('preview-image')).toBeVisible();
        //post-condition
        await pm.onDatasetsPage().deleteDatasetFromItsPage()
    })
    test.skip('Create new dataset with file upload', async({page})=>{
        const datasetName = 'AutoDataSet'+Math.floor(Math.random() * 100000);
        const pm = new PageManager(page);
        await pm.navigateTo().openDatasetsPage();
        await pm.onDatasetsPage().addDatasetUsingFileUpload(datasetName+' upload');
        await expect(page.getByTestId('dataset-detail-render-tid').locator('h1')).toHaveText(datasetName+' upload');
        await expect(page.getByTestId('preview-image')).toBeVisible();
        //post-condition
        await pm.onDatasetsPage().deleteDatasetFromItsPage()
    })
    test('Remove several datasets', async({page})=>{
        const pm = new PageManager(page);
        //await pm.navigateTo().openDatasetsPage();
        //preconditions
        const datasetName = 'AutoDataSet'+Math.floor(Math.random() * 100000);
        // await pm.onDatasetsPage().addDatasetUsingFileUpload(datasetName+' upload1');
        // await pm.navigateTo().openDatasetsPage();
        // await pm.onDatasetsPage().addDatasetUsingFileUpload(datasetName+' upload2');
        await createDatasetViaAPI(datasetName,'https://petapixel.com/assets/uploads/2022/06/what-is-a-jpeg-featured.jpg');

        //steps
        await pm.navigateTo().openDatasetsPage();
        await pm.onDatasetsPage().openYourWork();
        await page.waitForTimeout(2000);
        await page.reload();
        await pm.onDatasetsPage().deleteDatasetsContainingName('AutoDataSet');
        await page.reload();
        expect(page.locator('#site-content [role="listitem"]').getByText('AutoDataSet')).toBeHidden();
    })
})