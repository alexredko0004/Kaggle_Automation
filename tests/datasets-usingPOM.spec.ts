import { test,expect,request } from '@playwright/test';
import { createDatasetViaAxios, createDatasetViaPW } from '../precs/Datasets/datasetPrecs';
import { datasetRemoteLink1,datasetRemoteLink2 } from '../helpers/constants';
import { Datasets } from '../page-objects/DatasetsPage';
import { MainMenu } from '../page-objects/MainMenu';

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
        const datasetName = 'AutoDataSet'+Math.floor(Math.random() * 100000);
        const mainMenu = new MainMenu(page);
        await mainMenu.openDatasetsPage();
        const datasetPage = new Datasets(page);
        await datasetPage.addDatasetUsingRemoteLink(datasetName,datasetRemoteLink1);
        await expect(page.getByTestId('dataset-detail-render-tid').locator('h1')).toHaveText(datasetName);
        await expect(page.getByText('Remote source:')).toBeVisible();
        await expect(page.getByTestId('preview-image')).toBeVisible();
        //post-condition
        await datasetPage.deleteDatasetFromItsPage()
    })
    test('Create new dataset with file upload', async({page})=>{
        const datasetName = 'AutoDataSet'+Math.floor(Math.random() * 100000);
        const mainMenu = new MainMenu(page);
        await mainMenu.openDatasetsPage();
        const datasetPage = new Datasets(page);
        await datasetPage.addDatasetUsingFileUpload(datasetName+' upload');
        await expect(page.getByTestId('dataset-detail-render-tid').locator('h1')).toHaveText(datasetName+' upload');
        await expect(page.getByTestId('preview-image')).toBeVisible();
        //post-condition
        await datasetPage.deleteDatasetFromItsPage()
    })
    test('Remove several datasets', async({page,request})=>{
        const datasetName = 'AutoDataSet'+Math.floor(Math.random() * 100000);
        await test.step('precs', async()=>{
            await createDatasetViaPW(page, datasetName,datasetRemoteLink1);
            await createDatasetViaPW(page, datasetName+'AA',datasetRemoteLink2);
            await createDatasetViaPW(page, 'AA'+datasetName,datasetRemoteLink1)
            await createDatasetViaPW(page, 'BB'+datasetName,datasetRemoteLink1)
            await createDatasetViaPW(page, datasetName+'AAA',datasetRemoteLink2);
            await createDatasetViaPW(page, 'AAA'+datasetName,datasetRemoteLink1)
            await createDatasetViaPW(page, 'BBB'+datasetName,datasetRemoteLink1)
            await createDatasetViaPW(page, 'BBB1'+datasetName,datasetRemoteLink1)
        })
    
        const mainMenu = new MainMenu(page);
        const datasetPage = new Datasets(page);

        //steps
        await page.waitForTimeout(3000);
        await mainMenu.openDatasetsPage();
        await datasetPage.openYourWork();
        await page.waitForTimeout(1000);
        await page.reload();
        await datasetPage.deleteDatasetsContainingName('AutoDataSet');
        await page.reload();
        expect(page.locator('#site-content [role="listitem"]').getByText('AutoDataSet')).toBeHidden();
    })
})