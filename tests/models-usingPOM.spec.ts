import { test,expect } from '@playwright/test';
import { MainMenu } from '../page-objects/MainMenu';
import { Models } from '../page-objects/ModelsPage';
import { createModelViaPW, deleteModelViaPW } from '../precs/Models/modelPrecs';
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
        const requestPromise = page.waitForRequest('https://www.kaggle.com/api/i/models.ModelService/CreateModel');
        const responsePromise = page.waitForResponse('https://www.kaggle.com/api/i/models.ModelService/CreateModel');
        await modelsPage.addModelWithoutVariations(modelName,urlEnding,'Public');
        const request = (await requestPromise).postDataJSON();
        const response = (await responsePromise).json();
        await modelsPage.goToModelDetailBtn.click();
        await page.waitForTimeout(2000);
        expect(page.url()).toEqual(`${process.env.SITE_URL}`+'/models/'+`${await request.ownerSlug}/`+urlEnding);
        await expect(modelsPage.modelTitleFieldOnView).toHaveText(modelName);
        await expect(page.getByText(' · Created On ')).toContainText(`${currentYear()}.`+`${currentMonth()}.`+`${currentDate()}`);
        await page.getByRole('tab',{name:"Settings"}).click();
        expect(await page.locator('.mdc-layout-grid').getByRole('combobox').innerText()).toContain('Public');
        await deleteModelViaPW(page,(await response).id)
    })
    
    test('Edit Title and Subtitle for model', async({page})=>{
        const modelName = 'AutoModel'+Math.floor(Math.random() * 100000);
        const modelNameEdited = 'Edited'+modelName;
        const mainMenu = new MainMenu(page);
        const modelsPage = new Models(page);
        const model = await createModelViaPW(page,modelName,'Private')
        await mainMenu.openModelsPage();
        await page.goto(`${process.env.SITE_URL}`+'/models/'+`${await model.owner.slug}/`+`${await model.slug}`);
        await modelsPage.pencilEdit.click();
        await modelsPage.modelTitleFieldOnEdit.fill(modelNameEdited);
        await modelsPage.modelSubtitleFieldOnEdit.fill('Subtitle text for edit 1234567890.');
        await modelsPage.saveBtn.click();
        await expect(modelsPage.flashMessage).toBeVisible();
        await expect(modelsPage.flashMessage).toHaveText('Successfully updated the model.');
        await page.reload();
        await expect(modelsPage.modelTitleFieldOnView).toHaveText(modelNameEdited);
        await expect(page.getByText('Subtitle text for edit 1234567890.')).toBeVisible();
        await expect(modelsPage.addSubtitlePendingAction).toBeHidden();
        await mainMenu.openModelsPage();
        await modelsPage.openYourWork();
        await modelsPage.searchYourWork(modelName);
        await expect(page.locator('#site-content ul li',{hasText:`${modelName}`})).toBeHidden();
        await page.reload();
        await modelsPage.searchYourWork(modelNameEdited);
        await expect(page.locator('#site-content ul li',{hasText:`${modelNameEdited}`})).toBeVisible();
        expect(await page.locator('ul').getByRole('link').locator('span').first().innerText()).toEqual('Subtitle text for edit 1234567890.');
        await page.waitForTimeout(500);
        await page.locator('#site-content ul li',{hasText:`${modelNameEdited}`}).click();
        await modelsPage.pencilEdit.click();
        await modelsPage.modelSubtitleFieldOnEdit.clear();
        await modelsPage.saveBtn.click();
        await expect(modelsPage.flashMessage).toBeVisible();
        await expect(modelsPage.flashMessage).toHaveText('Successfully updated the model.');

        await mainMenu.openModelsPage();
        await modelsPage.openYourWork();
        await page.waitForTimeout(500);
        await page.reload();
        await modelsPage.searchYourWork(modelNameEdited);
        expect(await page.locator('ul').getByRole('link').locator('span').first().innerText()).toEqual('');
        await page.locator('#site-content ul li',{hasText:`${modelNameEdited}`}).click();
        await expect(page.locator('[wrap="hide"] p').nth(1)).toBeHidden();
        await expect(modelsPage.addSubtitlePendingAction).toBeVisible();

        await deleteModelViaPW(page,model.id)
    })

    // test('Edit authors for model', async({page})=>{
    //     const modelName = 'AutoModel'+Math.floor(Math.random() * 100000);
    //     const modelNameEdited = 'Edited'+modelName;
    //     const mainMenu = new MainMenu(page);
    //     const modelsPage = new Models(page);
    //     const model = await createModelViaPW(page,modelName,'Public')
    //     await mainMenu.openModelsPage();
    //     await page.goto(`${process.env.SITE_URL}`+'/models/'+`${await model.owner.slug}/`+`${await model.slug}`);
    //     await modelsPage.addModelAuthors('Jimm','Larry');
    //     await expect(modelsPage.flashMessage).toBeVisible();
    //     await expect(modelsPage.flashMessage).toHaveText('Successfully updated the authors.');
    //     await deleteModelViaPW(page,model.id)
        // await expect(page.locator('#site-content h1')).toHaveText(modelName);
        // await expect(page.getByText(' · Created On ')).toContainText(`${currentYear()}.`+`${currentMonth()}.`+`${currentDate()}`);
        // await page.getByRole('tab',{name:"Settings"}).click();
        // expect(await page.locator('.mdc-layout-grid').getByRole('combobox').innerText()).toContain('Public')
    //})

})