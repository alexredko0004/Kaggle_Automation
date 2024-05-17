import { test,expect } from '@playwright/test';
import { createDataset } from '../precs/datasetPrecs';
import { datasetRemoteLink1,datasetRemoteLink2 } from '../helpers/constants';
import { Datasets } from '../page-objects/DatasetsPage';
import { MainMenu } from '../page-objects/MainMenu';

//test.describe('tests using POM', async()=>{
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
    test.only('Remove several datasets', async({page})=>{
        const datasetName = 'AutoDataSet'+Math.floor(Math.random() * 100000);
        const url=datasetRemoteLink1;
        const fileName = url.split('/')
        await test.step('precs', async()=>{
            await createDataset(datasetName,datasetRemoteLink1);
            await createDataset(datasetName+'AA',datasetRemoteLink2);
            await createDataset('AA'+datasetName,datasetRemoteLink1)
            await createDataset('BB'+datasetName,datasetRemoteLink1)
            await createDataset(datasetName+'AAA',datasetRemoteLink2);
            await createDataset('AAA'+datasetName,datasetRemoteLink1)
            await createDataset('BBB'+datasetName,datasetRemoteLink1)
            await createDataset('BBB1'+datasetName,datasetRemoteLink1)
        })
        // let cookies = await page.context().cookies()
        // await page.request.post(`${process.env.CREATE_DATASET_ENDPOINT}`,{headers:{'X-Xsrf-Token':`${cookies[8].value}`},data:{
        //     "basicInfo": {
        //         "databundleVersionType": "REMOTE_URL_FILE_SET",
        //         "remoteUrlInfos": [
        //             {
        //                 "name": `${fileName[fileName.length-1]}`,
        //                 "url": `${url}`
        //             }
        //         ],
        //         "files": [],
        //         "directories": []
        //     },
        //     "title": `${datasetName}`,
        //     "slug": `${datasetName.toLowerCase()}`,
        //     "isPrivate": true,
        //     "licenseId": 4,
        //     "ownerUserId": 19095547,
        //     "referrer": "datasets_km"
        // }})
        
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
//})