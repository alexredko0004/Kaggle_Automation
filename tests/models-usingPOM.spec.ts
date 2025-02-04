import { test,expect } from '@playwright/test';
import { MainMenu } from '../page-objects/MainMenu';
import { Models } from '../page-objects/ModelsPage';
import { createModelViaPW, deleteModelViaPW } from '../precs/Models/modelPrecs';
import { currentYear, currentMonth, currentDate } from '../helpers/dates';
import {modelDeletionConfirmationPopupInnerText} from "../helpers/constants";
import { YourWork } from '../page-objects/YourWorkPage';
import { createCollectionViaPW, deleteCollectionViaPW } from '../precs/Collections/collectionPrecs';

let createdModel
test.describe('tests using POM', async()=>{
    test.beforeEach(async({page})=>{
        await page.goto('/');
    })
    
    test('Edit Title and Subtitle for model', async({page})=>{
        const modelName = 'AutoModel'+Math.floor(Math.random() * 100000);
        const modelNameEdited = 'Edited'+modelName;
        const mainMenu = new MainMenu(page);
        const modelsPage = new Models(page);
        const yourWorkPage = new YourWork(page);
        const model = await createModelViaPW(page,modelName,'Private')
        await test.step('Preconditions', async()=>{
            await mainMenu.openModelsPageViaMainMenu();
            await modelsPage.openModelProfile(model.owner.slug,model.slug);
        })
        await test.step('Verify edited data is saved on model profile', async()=>{
            await modelsPage.clickPencilEditBtn();
            await modelsPage.fillTitleOnEdit(modelNameEdited);
            await modelsPage.fillSubTitleOnEdit('Subtitle text for edit 1234567890.');
            await modelsPage.clickSaveBtn();
            await expect(modelsPage.getFlashMessageLocator()).toBeVisible();  
            expect(await modelsPage.getFlashMessageText()).toEqual('Successfully updated the model.');
            await page.reload();
            expect(await modelsPage.getModelTitleOnView()).toEqual(modelNameEdited);
            await expect(modelsPage.getLocatorByText('Subtitle text for edit 1234567890.')).toBeVisible(); 
            await expect(modelsPage.getAddSubtitlePendingAction()).toBeHidden();
        })
        await test.step('Verify edited data is visible on the list with models', async()=>{
            await page.waitForTimeout(500);
            await mainMenu.openModelsPageViaMainMenu();
            await modelsPage.openYourWork();
            await yourWorkPage.searchYourWork(modelName);
            await expect(await yourWorkPage.getListItemByNameOrSubtitle(modelName)).toBeHidden();
            await page.reload();
            await yourWorkPage.searchYourWork(modelNameEdited);
            await expect(await yourWorkPage.getListItemByNameOrSubtitle(modelNameEdited)).toBeVisible();
            expect(await yourWorkPage.getListItemSubtitle(yourWorkPage.listItem)).toContain('Subtitle text for edit 1234567890.');
        })
        await test.step('Verify removing of subtitle', async()=>{
            await yourWorkPage.clickListItem(modelNameEdited);
            await modelsPage.clickPencilEditBtn();
            await modelsPage.clearSubTitleOnEdit();
            await modelsPage.clickSaveBtn();
            await expect(modelsPage.getFlashMessageLocator()).toBeVisible();
            expect(await modelsPage.getFlashMessageText()).toEqual('Successfully updated the model.');

            await mainMenu.openModelsPageViaMainMenu();
            await modelsPage.openYourWork();
            await page.reload();
            await yourWorkPage.searchYourWork(modelNameEdited);
            expect(await yourWorkPage.getListItemSubtitle(yourWorkPage.listItem)).toContain('');
        })
        await test.step('Verify that subtitle is removed on model profile', async()=>{
            await yourWorkPage.clickListItem(modelNameEdited);
            expect(await modelsPage.isSubtitleVisibleOnModelProfile()).toEqual(false);
            await expect(modelsPage.getAddSubtitlePendingAction()).toBeVisible();
        })
        await test.step('Post condition. Remove model', async()=>{
            await deleteModelViaPW(page,model.id)
        })
        
    })

    test('Create new model with variation @smoke @smokeModel', async({page})=>{   
        const modelName = 'AutoModel'+Math.floor(Math.random() * 100000);
        const variationSlug = 'slug'+Math.floor(Math.random() * 100000);
        const urlEnding = 'ending'+Math.floor(Math.random() * 100000);
        const mainMenu = new MainMenu(page);
        const modelsPage = new Models(page);
        const yourWorkPage = new YourWork(page);
        const modelVisibility = modelsPage.randomModelVisibility(['Private']);
        let selectedFramework
        let selectedLicense
        await test.step('Preconditions', async()=>{
            await mainMenu.openModelsPageViaMainMenu();
            await modelsPage.clickNewBtn();
        })
        await test.step('Verify that creation is forbidden till all required fields are filled in', async()=>{
            await modelsPage.uploadVariationFile(['./resources/kaner_testing.pdf','./resources/kaner_testing2.pdf']);
            await modelsPage.fillModelNameFieldOnCreate(modelName);
            await modelsPage.clickEditForURLOnCreate();
            await modelsPage.fillURLFieldOnCreate(urlEnding);
            await modelsPage.selectVisibilityOnCreate(modelVisibility); 
            expect(await modelsPage.isCreateButtonEnabled()).toBe(false);
            selectedFramework = await modelsPage.selectRandomFrameworkOnCreate();
            selectedLicense = await modelsPage.selectRandomLicenseOnVariationCreate();
            expect(await modelsPage.isCreateButtonEnabled()).toBe(true);
        })
        await test.step('Verify that created model contains just added variation on model profile', async()=>{
            await modelsPage.fillVariationNameInput(variationSlug);
            createdModel = await modelsPage.clickCreateAndGetIdAndSlug();
            await modelsPage.clickGoToModelBtn();
            expect(page.url()).toEqual(`${process.env.SITE_URL}/models/${createdModel.ownerSlug}/${urlEnding}`);
            expect(await modelsPage.getModelVariationSlugVisibilityOnView(variationSlug)).toBe(true);
            expect(await modelsPage.getModelVariationAttachmentVisibilityOnView()).toBe(true);
            expect(await modelsPage.getModelVariationFrameworkOnView()).toEqual(selectedFramework);
            expect(await modelsPage.getModelVariationLicenseOnView()).toEqual(selectedLicense);
            //Rewrite this expect below
            await expect(page.getByText(' · Created On ')).toContainText(`${currentYear()}.${currentMonth()}.${currentDate()}`);
            await modelsPage.openTab('Settings');
            expect(await modelsPage.getModelVisibilitySettingOnView()).toEqual(modelVisibility)
        })
        await test.step('Verify that model is contains variation in the list of models', async()=>{
            await mainMenu.openModelsPageViaMainMenu();
            await modelsPage.openYourWork();
            await yourWorkPage.searchYourWork(modelName);
            expect((await yourWorkPage.getListItemDetailsModel(yourWorkPage.listItem)).visibility).toEqual(modelVisibility);
            expect((await yourWorkPage.getListItemDetailsModel(yourWorkPage.listItem)).countVariations).toEqual('1 Variation');
        })
        await test.step('Post condition. Remove model', async()=>{
            await deleteModelViaPW(page,createdModel.id)
        })
    })

    test('Add tags to model', async({page})=>{
        const modelName = 'AutoModel'+Date.now().toString();
        const mainMenu = new MainMenu(page);
        const modelsPage = new Models(page);
        const yourWorkPage = new YourWork(page);
        const tags = ['PIL','D3.Js','Text-To-Text Generation','Os','Brazil','Business'];
        const tagsWithCategories = ['Architecture > Word2vec Skip-Gram', 
                         'Architecture > MobileBert Uncased_L-24_H-128_B-512_A-4_F-4_OPT',
                         'Task > Text Fill-Mask',
                         'Packages > Weights & Biases',
                         'Language > Luba-Katanga',
                         'Architecture > 1x1 Convolution']
        const model = await createModelViaPW(page,modelName,'Private');
        await test.step('Preconditions',async()=>{
            await modelsPage.openModelProfile(model.owner.slug,model.slug);
            await modelsPage.clickAddTagsBtn();
        })
        await test.step('Search and select tags', async()=>{
            await modelsPage.tagsPanel().searchAndSelectTags(tags);
            const selectedTags = await modelsPage.tagsPanel().getArrayOfSelectedTags();
            for (let i=0;i<selectedTags.length;i++){
                expect(selectedTags[i].toLowerCase()).toContain(tags[i].toLowerCase())
            }
        })
        await test.step('Save added tags and verify pending action disappearing', async()=>{
            await modelsPage.tagsPanel().clickApplyBtn();
            await page.reload();
            await expect(modelsPage.getAddTagsBtn()).toBeHidden();
            await expect(modelsPage.getAddTagsPendingAction()).toBeHidden();
            await expect(modelsPage.getEditTagsBtn()).toBeVisible();
        })
        await test.step('Open tags panel and verify that selected items are saved', async()=>{
            await modelsPage.clickEditTagsBtn();
            const selectedTags = (await modelsPage.tagsPanel().getArrayOfSelectedTags()).map(val=>val.toLowerCase())
            expect(selectedTags.length).toEqual(tags.length);
            for (let e of tags){
                expect(selectedTags.includes(e.toLowerCase())).toBe(true)
            }
        })
        await test.step('Remove all previously selected tags and select new using categories', async()=>{
            await modelsPage.tagsPanel().removeAllTags();
            await modelsPage.tagsPanel().selectTagsFromCategory(tagsWithCategories);
            const selectedTags = await modelsPage.tagsPanel().getArrayOfSelectedTags();
            for (let i=0;i<selectedTags.length;i++){
                expect(selectedTags[i].toLowerCase()).toContain(tagsWithCategories[i].replace(/.*>\s/,'').toLowerCase())
            }
        })
        await test.step('Post condition. Remove model',async()=>{
            await deleteModelViaPW(page,model.id)
        })
        
    })

    test('Delete model from its page @smokeModel', async({page})=>{
        const modelName = 'AutoModel'+Date.now().toString();
        const mainMenu = new MainMenu(page);
        const modelsPage = new Models(page);
        const yourWorkPage = new YourWork(page);
        const modelVisibility = modelsPage.randomModelVisibility(['Private']);
        const model = await createModelViaPW(page,modelName,modelVisibility);
        await test.step('Prec. Open "Models" page', async()=>{
            await modelsPage.openModelProfile(model.owner.slug,model.slug);
        })
        await test.step('Verify that confirmaton pop-up is shown when trying to delete a model', async()=>{
            await modelsPage.clickThreeDotsBtnOnProfile();
            await modelsPage.selectOptionFromThreeDotsMenu('Delete model');
            expect(await modelsPage.isConfirmationPopupShown()).toBe(true);
            expect(await modelsPage.getConfirmationPopupHeaderInnerText()).toEqual('Confirm Deletion');
            expect(await modelsPage.getConfirmationPopupInnerText()).toEqual(modelDeletionConfirmationPopupInnerText);
        })
        await test.step('Verify that redirect happens once model is removed', async()=>{
            await modelsPage.clickBtnOnConfirmationDialog('Delete');
            await expect(yourWorkPage.getFlashMessageLocator()).toBeVisible();
            expect((await yourWorkPage.getFlashMessageText())[0]).toEqual('Deletion in progress');
            expect((await yourWorkPage.getFlashMessageText())[1]).toEqual('Successfully deleted your model. This page will reload shortly.');
            expect(await yourWorkPage.getPageURLAfterRedirect()).toEqual(`${process.env.SITE_URL}/models`);
        })
        await test.step('Verify that removed model is not shown in the list of models', async()=>{
            await mainMenu.openModelsPageViaMainMenu();
            await modelsPage.openYourWork();
            await page.reload();
            await expect(await yourWorkPage.getListItemByNameOrSubtitle(modelName)).toBeHidden();
            await yourWorkPage.searchYourWork(modelName);
            await expect(await yourWorkPage.getListItemByNameOrSubtitle(modelName)).toBeHidden();
        })
        
    })

    test('Upvote model', async({page})=>{
        const modelName = 'AutoModel'+Date.now().toString();
        const mainMenu = new MainMenu(page);
        const modelsPage = new Models(page);
        const yourWorkPage = new YourWork(page);
        const modelVisibility = modelsPage.randomModelVisibility(['Public','Private']);
        const model = await createModelViaPW(page,modelName,modelVisibility);
        let initialUpvoteCount = 0;
        let currentUpvoteCount;
        let upvotedItemsNames;
        let modelInTheList;
        await test.step('Prec. Open "Models" page', async()=>{
            await modelsPage.openModelProfile(model.owner.slug,model.slug);
        })
        await test.step('Verify that model can be upvoted from its profile', async()=>{
            await modelsPage.hoverOverUpvoteBtn();
            await expect(modelsPage.getTooltipLocator()).toBeVisible();
            expect(await modelsPage.getTooltipText()).toEqual('Upvote');
            expect(await modelsPage.getUpvoteBtnMode()).toBe('default');
            await modelsPage.clickUpvoteBtn();
            currentUpvoteCount = await modelsPage.getUpvotesCounterValue();
            expect(currentUpvoteCount).toEqual(initialUpvoteCount+1);
            await modelsPage.hoverOverUpvoteBtn();
            await expect(modelsPage.getTooltipLocator()).toBeVisible();
            expect(await modelsPage.getTooltipText()).toEqual('Undo upvote');
            expect(await modelsPage.getUpvoteBtnMode()).toBe('selected');
        })
        await test.step('Verify that model is upvoted on "Your Work" page', async()=>{
            await mainMenu.openModelsPageViaMainMenu();
            await page.waitForTimeout(3000);
            await modelsPage.openYourWork();
            upvotedItemsNames = await yourWorkPage.getNamesOfUpvotedItems();
            for (let name of upvotedItemsNames){
                expect(upvotedItemsNames.includes(modelName)).toBe(true)
            }
            modelInTheList = await yourWorkPage.getListItemByNameOrSubtitle(modelName);
            expect(await yourWorkPage.getUpvotesCountForListItem(modelInTheList)).toEqual(initialUpvoteCount+1);
            expect(await yourWorkPage.isListItemUpvoted(modelInTheList)).toBe(true);
        })
        await test.step('Verify that upvote can be removed on "Your Work" page', async()=>{
            await yourWorkPage.clickUpvoteBtnForListItem(modelInTheList);
            upvotedItemsNames = await yourWorkPage.getNamesOfUpvotedItems();
            for (let name of upvotedItemsNames){
                expect(upvotedItemsNames.includes(modelName)).toBe(false)
            }
            expect(await yourWorkPage.getUpvotesCountForListItem(modelInTheList)).toEqual(initialUpvoteCount);
            expect(await yourWorkPage.isListItemUpvoted(modelInTheList)).toBe(false);
        })
        await test.step('Verify that removed upvote on "Your Work" page is applied to model profile', async()=>{
            await yourWorkPage.clickListItem(modelName);
            currentUpvoteCount = await modelsPage.getUpvotesCounterValue();
            expect(currentUpvoteCount).toEqual(initialUpvoteCount);
            await modelsPage.hoverOverUpvoteBtn();
            await expect(modelsPage.getTooltipLocator()).toBeVisible();
            expect(await modelsPage.getTooltipText()).toEqual('Upvote');
            expect(await modelsPage.getUpvoteBtnMode()).toBe('default');

        })
        await test.step('Verify that upvote made on "Your Work" page is applied to model profile', async()=>{
            await mainMenu.openModelsPageViaMainMenu();
            await modelsPage.openYourWork();
            await yourWorkPage.clickUpvoteBtnForListItem(modelInTheList);
            upvotedItemsNames = await yourWorkPage.getNamesOfUpvotedItems();
            for (let name of upvotedItemsNames){
                expect(upvotedItemsNames.includes(modelName)).toBe(true)
            }
            expect(await yourWorkPage.isListItemUpvoted(modelInTheList)).toBe(true);

            await yourWorkPage.clickListItem(modelName);
            currentUpvoteCount = await modelsPage.getUpvotesCounterValue();
            expect(currentUpvoteCount).toEqual(initialUpvoteCount+1);
            await modelsPage.hoverOverUpvoteBtn();
            await expect(modelsPage.getTooltipLocator()).toBeVisible();
            expect(await modelsPage.getTooltipText()).toEqual('Undo upvote');
            expect(await modelsPage.getUpvoteBtnMode()).toBe('selected');
        })
        await test.step('Post condition. Remove model',async()=>{
            await deleteModelViaPW(page,model.id)
        })
        
    })

    test('Add model to collection', async({page})=>{
        const modelName = 'AutoModel'+Date.now().toString();
        const collectionName = 'Collection'+Date.now().toString();
        const mainMenu = new MainMenu(page);
        const modelsPage = new Models(page);
        const yourWorkPage = new YourWork(page);
        const modelVisibility = modelsPage.randomModelVisibility(['Public','Private']);
        const model = await createModelViaPW(page,modelName,modelVisibility);
        const collection = await createCollectionViaPW(page,collectionName);
        let availableCollections
        await test.step('Prec. Open "Models" page', async()=>{
            await modelsPage.openModelProfile(model.owner.slug,model.slug);
        })
        await test.step('Verify that model can be added to collection from its profile.', async()=>{
            await modelsPage.clickThreeDotsBtnOnProfile();
            await modelsPage.selectOptionFromThreeDotsMenu('Add to Collection');
            availableCollections = await modelsPage.collectionsPanel().getAvailableCollectionsOnPanel();
            await modelsPage.collectionsPanel().selectCollectionsWithNames([collectionName]);
            await modelsPage.collectionsPanel().clickAddBtn();
            expect (await modelsPage.collectionsPanel().isCollectionsPanelOpened()).toBe(false);
            await expect(yourWorkPage.getFlashMessageLocator()).toBeVisible();
            expect(await yourWorkPage.getFlashMessageText()).toEqual('Item was added successfully');
        })
        await test.step('Verify that model cannot be added to one collection twice.', async()=>{
            await modelsPage.reloadPage();
            await modelsPage.clickThreeDotsBtnOnProfile();
            await modelsPage.selectOptionFromThreeDotsMenu('Add to Collection');
            expect((await modelsPage.collectionsPanel().getAvailableCollectionsOnPanel()).length).toEqual(availableCollections.length-1);
            expect((await modelsPage.collectionsPanel().getAvailableCollectionsOnPanel()).includes(collectionName)).toBe(false)
        })
        await test.step('Post condition. Remove model',async()=>{
            await deleteModelViaPW(page,model.id);
            await deleteCollectionViaPW(page,collection.collectionId)
        })
        
    })
})