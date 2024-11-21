import { test,expect } from '../fixtures/baseTest';
import { deleteCollectionViaPW, createCollectionViaPW } from '../precs/Collections/collectionPrecs';
import { YourWork } from '../page-objects/YourWorkPage';
import { Collections } from '../page-objects/Collections';


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
        const collName = 'COLL'+ Date.now().toString();
        const yourWorkPage = new YourWork(page);
        await test.step('Verify that new collection cannot be added without name', async()=>{
             await datasetsPage.openDatasetsPage();
             await yourWorkPage.openYourWork();
             await yourWorkPage.selectItemFromCreateMenu('New Collection');
             expect(await collections.isNewCollectionModalVisible()).toBe(true);
             expect(await collections.isCreateButtonEnabledOnNewCollectionModal()).toBe(true);
             await collections.fillCollectionNameOnModal(collName);
             expect(await collections.isCreateButtonEnabledOnNewCollectionModal()).toBe(false);
        })
        await test.step('Verify that new collection can be added and is shown on "Collections" tab', async()=>{
            collection = await collections.clickCreateBtnAndGetCreatedCollectionID();
            expect(await yourWorkPage.getSelectedTabName()).toEqual('Collections')
            
       })
    
        await deleteCollectionViaPW(page,collection.collectionId)
    })
})