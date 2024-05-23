import { test,expect } from '@playwright/test';
import { MainMenu } from '../page-objects/MainMenu';
import { Models } from '../page-objects/ModelsPage';
import { createModelViaPW } from '../precs/Models/modelPrecs';
import { currentYear, currentMonth, currentDate } from '../helpers/dates';

test.describe('tests using POM', async()=>{
    test.beforeEach(async({page})=>{
        await page.goto('/');
    })
    test('Create new model without variations', async({page})=>{
        const modelName = 'AutoModel'+Math.floor(Math.random() * 100000);
        const urlEnding = 'ending'+Math.floor(Math.random() * 100000);
        const mainMenu = new MainMenu(page);
        const modelsPage = new Models(page);
        
        await mainMenu.openModelsPage();
        const requestPromise = page.waitForRequest('https://www.kaggle.com/api/i/models.ModelService/CreateModel')
        await modelsPage.addModelWithoutVariations(modelName,urlEnding,'Public');
        const request = (await requestPromise).postDataJSON();
        await modelsPage.goToModelDetailBtn.click();
        await page.waitForTimeout(2000);
        expect(page.url()).toEqual(`${process.env.SITE_URL}`+'/models/'+`${await request.ownerSlug}/`+urlEnding);
        await expect(page.locator('#site-content h1')).toHaveText(modelName);
        await expect(page.getByText(' · Created On ')).toContainText(`${currentYear()}.`+`${currentMonth()}.`+`${currentDate()}`);
        await page.getByRole('tab',{name:"Settings"}).click();
        expect(await page.locator('.mdc-layout-grid').getByRole('combobox').innerText()).toContain('Public')
    })
    
    test.only('Edit model', async({page})=>{
        const modelName = 'AutoModel'+Math.floor(Math.random() * 100000);
        const urlEnding = 'ending'+Math.floor(Math.random() * 100000);
        const mainMenu = new MainMenu(page);
        const modelsPage = new Models(page);
        const requestPromise = page.waitForRequest('https://www.kaggle.com/api/i/models.ModelService/CreateModel')
        await test.step('Preconditions', async()=>{
             await createModelViaPW(page,modelName,'Public')
        })
        
        await mainMenu.openModelsPage();
        await modelsPage.addModelWithoutVariations(modelName,urlEnding,'Public');
        const request = (await requestPromise).postDataJSON();
        await page.goto(`${process.env.SITE_URL}`+'/models/'+`${await request.ownerSlug}/`+`${await request.model.slug}`);
        await page.pause()
        // await expect(page.locator('#site-content h1')).toHaveText(modelName);
        // await expect(page.getByText(' · Created On ')).toContainText(`${currentYear()}.`+`${currentMonth()}.`+`${currentDate()}`);
        // await page.getByRole('tab',{name:"Settings"}).click();
        // expect(await page.locator('.mdc-layout-grid').getByRole('combobox').innerText()).toContain('Public')
    })

})