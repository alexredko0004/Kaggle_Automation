import { test,expect } from '../fixtures/baseTest';
import { deleteCollectionViaPW, createCollectionViaPW } from '../precs/Collections/collectionPrecs';
import { YourWork } from '../page-objects/YourWorkPage';
import { createDatasetViaPW, deleteDatasetViaPW } from '../precs/Datasets/datasetPrecs';
import { datasetRemoteLink2 } from '../helpers/constants';


test.describe('tests using POM for Collections', async()=>{
    test.beforeEach(async({page,mainMenu})=>{
        await mainMenu.openHomePage();
    })

    test('Create and remove collection via PW @smoke @smokeDataset', async({page,collections})=>{
        const collName = 'COLL'+ Date.now().toString();
        const coll = await createCollectionViaPW(page,collName);
        expect((await collections.getListOfCollectionsForUser())[0].name).toEqual(collName)
        await deleteCollectionViaPW(page,coll.collectionId)
    })

    test('Create collection via "Your Work" page', async({page,collections, datasetsPage})=>{
        let collection
        let collectionsCount
        let createdDataset
        const collName = 'COLL'+ Date.now().toString();
        const datasetName = 'DSFoColl'+ Date.now().toString();
        const yourWorkPage = new YourWork(page);
        await test.step('Preconditions', async()=>{
             createdDataset = await createDatasetViaPW(page, datasetName, [datasetRemoteLink2]);
             await datasetsPage.openDatasetsPage();
             await yourWorkPage.openYourWork();
             await yourWorkPage.openTab('Collections');
     })
        await test.step('Verify that new collection cannot be added without name', async()=>{
             collectionsCount = await yourWorkPage.getCountOfItemsOnTab('Collections');
             await yourWorkPage.selectItemFromCreateMenu('New Collection');
             expect(await collections.isCollectionModalWithProvidedNameVisible('New Collection')).toBe(true);
             expect(await collections.isMainButtonEnabledOnModal()).toBe(false);
             await collections.clickMainBtnOnPopUpAndGetCollectionID("force");
             expect(await collections.isCollectionModalWithProvidedNameVisible('New Collection')).toBe(true);
             await collections.fillCollectionNameOnModal(collName);
             expect(await collections.isMainButtonEnabledOnModal()).toBe(true);
        })
        await test.step('Verify that new collection can be added and is shown on "Collections" tab', async()=>{
            collection = await collections.clickMainBtnOnPopUpAndGetCollectionID();
            expect(await yourWorkPage.getSelectedTabName()).toEqual('Collections');
            expect(await collections.getSelectedCollectionName()).toEqual(collName);
            expect(await collections.isSelectedCollectionEmpty()).toBe(true);
            await yourWorkPage.openTab('Collections');
            const newCollectionsCount = await yourWorkPage.getCountOfItemsOnTab('Collections');
            expect(newCollectionsCount).toEqual(collectionsCount+1);
            expect((await collections.getCollectionNamesAndNumberOFTheirContents())[0].name).toEqual(collName);
            expect((await collections.getCollectionNamesAndNumberOFTheirContents())[0].itemsCount).toEqual(0);
       })
       await test.step('Verify newly created collection is shown when trying to add dataset to collection', async()=>{
            await yourWorkPage.openTab('Datasets');
            await yourWorkPage.reloadPage();
            await yourWorkPage.clickListItem(datasetName);
            await datasetsPage.clickThreeDotsBtnOnProfile();
            await datasetsPage.selectOptionFromThreeDotsMenu('Add to Collection');
            let availableCollections = await datasetsPage.collectionsPanel().getAvailableCollectionsOnPanel();
            expect(availableCollections.includes(collName)).toBe(true)
       })
       await test.step('Verify newly created collection is shown on "Overview" tab', async()=>{
            await datasetsPage.openDatasetsPage();
            await yourWorkPage.openYourWork();
            await yourWorkPage.openTab('Overview');
            expect ((await yourWorkPage.getCollectionsOnOverviewTab())[0].name).toEqual(collName);
            expect ((await yourWorkPage.getCollectionsOnOverviewTab())[0].itemsCount).toEqual(0)
       })
       await test.step('Post condition. Remove collection and model', async()=>{
            await deleteCollectionViaPW(page,collection.collectionId)
            await deleteDatasetViaPW(page,createdDataset.datasetSlug,createdDataset.ownerSlug)
       })
    })

    test('Rename collection', async({page,collections, datasetsPage})=>{
     let collectionsCount
     const collName = 'COLL'+ Date.now().toString();
     const collNewName = collName+'Edit';
     const datasetName = 'DSFoColl'+ Date.now().toString();
     const yourWorkPage = new YourWork(page);
     const coll = await createCollectionViaPW(page,collName);
     const createdDataset = await createDatasetViaPW(page, datasetName, [datasetRemoteLink2]);
     await test.step('Preconditions', async()=>{
          await datasetsPage.openDatasetsPage();
          await yourWorkPage.openYourWork();
          await yourWorkPage.openTab('Collections');
          collectionsCount = await yourWorkPage.getCountOfItemsOnTab('Collections');
     })
     await test.step('Verify that pop-up for renaming is opened', async()=>{
          await collections.clickThreeDotsButtonForCollectionWithName(collName);
          await collections.selectOptionFromThreeDotsMenuForCollection("Rename");
          expect(await collections.isCollectionModalWithProvidedNameVisible('Rename Collection')).toBe(true);
          expect(await collections.getNameFromRemoveCollectionModal()).toEqual(collName);
          expect(await collections.isMainButtonEnabledOnModal()).toBe(false);
     })
     await test.step('Verify that collection cannot be edited and saved with empty name', async()=>{
          await collections.fillCollectionNameOnModal('');
          await collections.clickMainBtnOnPopUpAndGetCollectionID('force');
          expect(await collections.isCollectionModalWithProvidedNameVisible('Rename Collection')).toBe(true);
          expect(await collections.getNameFromRemoveCollectionModal()).toEqual('');
          expect(await collections.isMainButtonEnabledOnModal()).toBe(false);
     })
     await test.step('Verify that collection can be saved with new name', async()=>{
          await collections.fillCollectionNameOnModal(collNewName);
          expect(await collections.isMainButtonEnabledOnModal()).toBe(true);
          await collections.clickMainBtnOnPopUpAndGetCollectionID();
          expect(await collections.isCollectionModalWithProvidedNameVisible('Rename Collection')).toBe(false);
          expect(await yourWorkPage.getCountOfItemsOnTab('Collections')).toEqual(collectionsCount);
          const activeCollections = await collections.getCollectionNamesAndNumberOFTheirContents();
          expect(activeCollections.filter(item=>item.name===collName).length).toEqual(0);
          expect(activeCollections.filter(item=>item.name===collNewName).length).toEqual(1);
     }) 
     await test.step('Verify edited collection name is shown on "Overview" tab', async()=>{
          await yourWorkPage.openTab('Overview');
          const activeCollectionsOnOverview = await yourWorkPage.getCollectionsOnOverviewTab();
          expect(activeCollectionsOnOverview.filter(item=>item.name===collName).length).toEqual(0);
          expect(activeCollectionsOnOverview.filter(item=>item.name===collNewName).length).toEqual(1);
     })  
     await test.step('Verify edited collection name is shown when trying to add dataset to collection', async()=>{
          await yourWorkPage.openTab('Datasets');
          await yourWorkPage.reloadPage();
          await yourWorkPage.clickListItem(datasetName);
          await datasetsPage.clickThreeDotsBtnOnProfile();
          await datasetsPage.selectOptionFromThreeDotsMenu('Add to Collection');
          let availableCollections = await datasetsPage.collectionsPanel().getAvailableCollectionsOnPanel();
          expect(availableCollections.includes(collName)).toBe(false);
          expect(availableCollections.includes(collNewName)).toBe(true)
     })
    await test.step('Post condition. Remove collection and model', async()=>{
         await deleteCollectionViaPW(page,coll.collectionId)
         await deleteDatasetViaPW(page,createdDataset.datasetSlug,createdDataset.ownerSlug)
    })
 })
})