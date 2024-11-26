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
        expect((await collections.getListOfCollectionsForUser())[0].name).toEqual(collName+'1')
        await deleteCollectionViaPW(page,coll.collectionId)
    })

    test('Create collection via "Your Work" page', async({page,collections, datasetsPage})=>{
        let collection
        let collectionsCount
        const collName = 'COLL'+ Date.now().toString();
        const datasetName = 'DSFoColl'+ Date.now().toString();
        const yourWorkPage = new YourWork(page);
        const createdDataset = await createDatasetViaPW(page, datasetName, [datasetRemoteLink2]);
        await test.step('Verify that new collection cannot be added without name', async()=>{
             await datasetsPage.openDatasetsPage();
             await yourWorkPage.openYourWork();
             await yourWorkPage.openTab('Collections');
             collectionsCount = await yourWorkPage.getCountOfItemsOnTab('Collections');
             await yourWorkPage.selectItemFromCreateMenu('New Collection');
             expect(await collections.isNewCollectionModalVisible()).toBe(true);
             expect(await collections.isCreateButtonEnabledOnNewCollectionModal()).toBe(true);
             await collections.clickCreateBtnAndGetCreatedCollectionID("force");
             expect(await collections.isNewCollectionModalVisible()).toBe(true);
             await collections.fillCollectionNameOnModal(collName);
             expect(await collections.isCreateButtonEnabledOnNewCollectionModal()).toBe(false);
        })
        await test.step('Verify that new collection can be added and is shown on "Collections" tab', async()=>{
            collection = await collections.clickCreateBtnAndGetCreatedCollectionID();
            expect(await yourWorkPage.getSelectedTabName()).toEqual('Collections');
            expect(await collections.getSelectedCollectionName()).toEqual(collName);
            expect(await collections.isSelectedCollectionEmpty()).toBe(true);
            await yourWorkPage.openTab('Collections');
            const newCollectionsCount = await yourWorkPage.getCountOfItemsOnTab('Collections');
            expect(newCollectionsCount).toEqual(collectionsCount+1);
            expect((await collections.getCollectionNamesAndNumberOFTheirContents())[0].name).toEqual(collName);
            expect((await collections.getCollectionNamesAndNumberOFTheirContents())[0].itemsCount).toEqual(0);
       })
       await test.step('Verify newly created collection is shown when trying to add model to collection', async()=>{
            await yourWorkPage.openTab('Datasets');
            await yourWorkPage.reloadPage();
            await yourWorkPage.clickListItem(datasetName);
            await datasetsPage.clickThreeDotsBtnOnProfile();
            await datasetsPage.selectOptionFromThreeDotsMenu('Add to Collection');
            let availableCollections = await datasetsPage.collectionsPanel().getAvailableCollections();
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
})