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
})