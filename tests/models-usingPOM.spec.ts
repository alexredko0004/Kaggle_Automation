import { test,expect } from '@playwright/test';
import { MainMenu } from '../page-objects/MainMenu';
import { Models } from '../page-objects/ModelsPage';
import { createModelViaPW, deleteModelViaPW } from '../precs/Models/modelPrecs';
import { currentYear, currentMonth, currentDate } from '../helpers/dates';
import { YourWork } from '../page-objects/YourWorkPage';
import { Tags } from '../page-objects/Tags';

const modelVisibility = 
test.describe('tests using POM', async()=>{
    test.beforeEach(async({page})=>{
        await page.goto('/');
    })
    test('Create new model without variations', async({page})=>{
        const modelName = 'AutoModel'+Date.now().toString();
        const urlEnding = 'ending'+Math.floor(Math.random() * 100000);
        const mainMenu = new MainMenu(page);
        const modelsPage = new Models(page);

        await mainMenu.openModelsPage();
        await modelsPage.clickNewBtn();
        await expect(modelsPage.createModelBtn).toBeDisabled();
        await modelsPage.fillModelTitleFieldOnCreate(modelName);
        await expect(modelsPage.createModelBtn).toBeEnabled();
        await modelsPage.clickEditForURLOnCreate();
        await modelsPage.fillURLFieldOnCreate(urlEnding);
        await modelsPage.selectVisibilityOnCreate('Public');
        const requestPromise = modelsPage.getCreatedModelRequestPromise();
        const responsePromise = modelsPage.getCreatedModelResponsePromise();
        await modelsPage.clickCreateModel();
        const request = await modelsPage.getCreatedModelRequestParams(requestPromise);
        const response = await modelsPage.getCreatedModelResponseParams(responsePromise);
        await page.waitForTimeout(2000);
        await page.reload();
        // await modelsPage.clickGoToModelDetailsBtn();
        await page.goto(`${process.env.SITE_URL}`+'/models/'+`${request.ownerSlug}/`+urlEnding)
        await page.waitForTimeout(2000);
        expect(page.url()).toEqual(`${process.env.SITE_URL}/models/${request.ownerSlug}/`+urlEnding);
        expect(await modelsPage.getModelTitleOnView()).toEqual(modelName);
        await expect(page.getByText(' · Created On ')).toContainText(`${currentYear()}.`+`${currentMonth()}.`+`${currentDate()}`);
        await modelsPage.openTab('Settings');
        expect(await modelsPage.getModelVisibilitySettingOnView()).toEqual('Public');
        await deleteModelViaPW(page,response.modelId)
    })
    
    test('Edit Title and Subtitle for model', async({page})=>{
        const modelName = 'AutoModel'+Math.floor(Math.random() * 100000);
        const modelNameEdited = 'Edited'+modelName;
        const mainMenu = new MainMenu(page);
        const modelsPage = new Models(page);
        const yourWorkPage = new YourWork(page);
        const model = await createModelViaPW(page,modelName,'Private')
        await mainMenu.openModelsPage();
        await page.goto(`${process.env.SITE_URL}/models/${model.owner.slug}/${model.slug}`);
        await modelsPage.clickPencilEditBtn();
        await modelsPage.fillTitleOnEdit(modelNameEdited);
        await modelsPage.fillSubTitleOnEdit('Subtitle text for edit 1234567890.');
        await modelsPage.clickSaveBtn();
        await expect(modelsPage.flashMessage).toBeVisible();   //??? How to make this assertion without using the controls from constructor
        expect(await modelsPage.getFlashMessageText()).toEqual('Successfully updated the model.');
        await page.reload();
        expect(await modelsPage.getModelTitleOnView()).toEqual(modelNameEdited);
        await expect(page.getByText('Subtitle text for edit 1234567890.')).toBeVisible();  //??? How to make this assertion without using the controls from constructor 
        await expect(modelsPage.addSubtitlePendingAction).toBeHidden(); //??? How to make this assertion without using the controls from constructor
        await page.waitForTimeout(500);
        await mainMenu.openModelsPage();
        await modelsPage.openYourWork();
        await yourWorkPage.searchYourWork(modelName);
        await expect(await yourWorkPage.getListItemByNameOrSubtitle(modelName)).toBeHidden();
        await page.reload();
        await yourWorkPage.searchYourWork(modelNameEdited);
        await expect(await yourWorkPage.getListItemByNameOrSubtitle(modelNameEdited)).toBeVisible();
        expect(await yourWorkPage.getListItemSubtitle(yourWorkPage.listItem)).toContain('Subtitle text for edit 1234567890.');
        await yourWorkPage.clickListItem(modelNameEdited);
        await modelsPage.clickPencilEditBtn();
        await modelsPage.clearSubTitleOnEdit();
        await modelsPage.clickSaveBtn();
        await expect(modelsPage.flashMessage).toBeVisible();  //??? How to make this assertion without using the controls from constructor
        expect(await modelsPage.getFlashMessageText()).toEqual('Successfully updated the model.');

        await mainMenu.openModelsPage();
        await modelsPage.openYourWork();
        await page.reload();
        await yourWorkPage.searchYourWork(modelNameEdited);
        expect(await yourWorkPage.getListItemSubtitle(yourWorkPage.listItem)).toContain('');
        await yourWorkPage.clickListItem(modelNameEdited);
        expect(await modelsPage.isSubtitleVisibleOnModelProfile()).toEqual(false);
        await expect(modelsPage.addSubtitlePendingAction).toBeVisible();  //??? How to make this assertion without using the controls from constructor

        await deleteModelViaPW(page,model.id)
    })

    test('Create new model with variation', async({page})=>{
        const modelName = 'AutoModel'+Math.floor(Math.random() * 100000);
        const variationSlug = 'slug'+Math.floor(Math.random() * 100000);
        const mainMenu = new MainMenu(page);
        const modelsPage = new Models(page);
        const yourWorkPage = new YourWork(page);
        const modelVisibility = modelsPage.randomModelVisibility(['Public','Private']);
        await mainMenu.openModelsPage();
        await modelsPage.clickNewBtn();
        await modelsPage.fillModelTitleFieldOnCreate(modelName);
        await expect(modelsPage.createModelBtn).toBeEnabled();
        await modelsPage.selectVisibilityOnCreate(modelVisibility);
        const createdModel = await modelsPage.saveModelAndGetIdAndSlug();
        await modelsPage.selectFrameworkOnCreate('Other');
        await modelsPage.clickAddNewVariationBtn();
        await modelsPage.uploadVariationFile(['./resources/tree.jpg','./resources/123.jpg']);
        await modelsPage.fillVariationSlugInput(variationSlug);
        expect(await modelsPage.getVariationFutureURL()).toContain(`${process.env.SITE_URL}/models/${createdModel.ownerSlug}/${modelName.toLowerCase()}/other/${variationSlug}`);
        await modelsPage.selectLicenseOnVariationCreate('GPL 3');
        await modelsPage.clickCreateBtn();
        await page.waitForTimeout(4000)
        await modelsPage.clickGoToModelDetailsBtn();
        await expect(page.getByLabel(variationSlug)).toBeVisible();
        await expect(page.getByTestId('preview-image')).toBeVisible();
        await mainMenu.openModelsPage();
        await modelsPage.openYourWork();
        await yourWorkPage.searchYourWork(modelName);
        expect((await yourWorkPage.getListItemDetailsModel(yourWorkPage.listItem)).visibility).toEqual(modelVisibility);
        expect((await yourWorkPage.getListItemDetailsModel(yourWorkPage.listItem)).countVariations).toEqual('1 Variation');

        await deleteModelViaPW(page,createdModel.id)
    })

    test('Add tags to model', async({page})=>{
        const modelName = 'AutoModel'+Date.now().toString();
        const mainMenu = new MainMenu(page);
        const modelsPage = new Models(page);
        const yourWorkPage = new YourWork(page);
        const tagsPanel = new Tags(page);
        const tags = ['PIL','D3.Js','Text-To-Text Generation','Os','Brazil','Business'];
        const model = await createModelViaPW(page,modelName,'Private')
        await page.goto(`${process.env.SITE_URL}/models/${model.owner.slug}/${model.slug}`);
        await modelsPage.clickAddTagsBtn();
        
        await tagsPanel.searchAndSelectTags(tags);
        const selectedTags = await tagsPanel.getArrayOfSelectedTags();
        for (let i=0;i<selectedTags.length;i++){
            expect(selectedTags[i].toLowerCase()).toContain(tags[i].toLowerCase())
        }
        await tagsPanel.clickApplyBtn();
        await page.reload();
        await expect(modelsPage.addTagsBtn).toBeHidden();
        await expect(modelsPage.addTagsPendingAction).toBeHidden();
        await expect(modelsPage.editTagsBtn).toBeVisible();
        await modelsPage.clickEditTagsBtn();
        for (let i=0;i<selectedTags.length;i++){
            expect(selectedTags[i].toLowerCase()).toContain(tags[i].toLowerCase())
        }
        await deleteModelViaPW(page,model.id)
    })
})