import { en, en_CA, Faker, fr, fr_CA, Randomizer } from '@faker-js/faker';
import { capitalize } from '@loufa/loufairy';
import { getUniqueFilename } from '@pictaccio/admin-api/';
// @ts-ignore
import { ProductType, ProductTypes } from '@pictaccio/shared/src/types/product_type';
// @ts-ignore
import { WorkflowOptions } from '@pictaccio/shared/src/types/workflow_options';
// @ts-ignore
import { LocalizedString } from '@pictaccio/shared/src/types/localized_string';
// @ts-ignore
import { OrderSnapshot } from '@pictaccio/shared/src/types/order_snapshot';
// @ts-ignore
import { calculatePhysicalProduct } from '@pictaccio/shared/src/utils/cart_item_price_calculators';
import { OrderCartItem, OrderCartItems } from '../src/types/order_cart_item';
import { UniqueEnforcer } from 'enforce-unique';
import fetch from 'node-fetch';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { RandomGenerator, xoroshiro128plus } from 'pure-rand';
import { Container } from 'typedi';
import { bootstrap } from '../src/bootstrap';
import { ConfigSchema } from '../src/core/config_schema';
import type { TransactionalBackground } from '../src/database/entities/transactional_background';
import type { TransactionalBackgroundCategory } from '../src/database/entities/transactional_background_category';
import type { TransactionalDeliveryOption } from '../src/database/entities/transactional_delivery_option';
import type { TransactionalDeliveryOptionGroup } from '../src/database/entities/transactional_delivery_option_group';
import type { TransactionalProduct } from '../src/database/entities/transactional_product';
import type { TransactionalProductCatalog } from '../src/database/entities/transactional_product_catalog';
import type { TransactionalProductCategory } from '../src/database/entities/transactional_product_category';
import type { TransactionalProductThemeSet } from '../src/database/entities/transactional_product_theme_set';
import type { TransactionalProductTypeTheme } from '../src/database/entities/transactional_product_type_theme';
import type { TransactionalWorkflow } from '../src/database/entities/transactional_workflow';
import type { TransactionalSession } from '../src/database/entities/transactional_session';
import type { TransactionalSubject } from '../src/database/entities/transactional_subject';
import type { TransactionalSubjectGroup } from '../src/database/entities/transactional_subject_group';
import type { TransactionalOrder } from '../src/database/entities/transactional_order';
import type { TransactionalContact } from '../src/database/entities/transactional_contact';
import type { TransactionalTransaction } from '../src/database/entities/transactional_transaction';
import { configLoader } from '../src/loaders/config';
import { typediLoader } from '../src/loaders/typedi';
import { typeormLoader } from '../src/loaders/typeorm';

type Fakers = {
    general: Faker;
    en: Faker;
    fr: Faker;
}

const COUNT_BACKGROUND_CATEGORIES = parseInt(process.env.COUNT_BACKGROUND_CATEGORIES, 10);
const COUNT_BACKGROUNDS = parseInt(process.env.COUNT_BACKGROUNDS, 10);
const COUNT_DELIVERY_OPTIONS = parseInt(process.env.COUNT_DELIVERY_OPTIONS, 10);
const COUNT_DELIVERY_OPTION_GROUPS = parseInt(process.env.COUNT_DELIVERY_OPTION_GROUPS, 10);
const COUNT_PRODUCTS = parseInt(process.env.COUNT_PRODUCTS, 10);
const COUNT_THEME_SETS = parseInt(process.env.COUNT_THEME_SETS, 10);
const COUNT_PRODUCT_CATEGORIES = parseInt(process.env.COUNT_PRODUCT_CATEGORIES, 10);
const COUNT_PRODUCT_CATALOGS = parseInt(process.env.COUNT_PRODUCT_CATALOGS, 10);
const COUNT_SESSIONS = parseInt(process.env.COUNT_SESSIONS, 10);
const COUNT_SUBJECTS_MIN = parseInt(process.env.COUNT_SUBJECTS_MIN, 10);
const COUNT_SUBJECTS_MAX = parseInt(process.env.COUNT_SUBJECTS_MAX, 10);
const COUNT_SUBJECT_PHOTOS_MIN = parseInt(process.env.COUNT_SUBJECT_PHOTOS_MIN, 10);
const COUNT_SUBJECT_PHOTOS_MAX = parseInt(process.env.COUNT_SUBJECT_PHOTOS_MAX, 10);
const COUNT_SUBJECT_GROUPS_MIN = parseInt(process.env.COUNT_SUBJECT_GROUPS_MIN, 10);
const COUNT_SUBJECT_GROUPS_MAX = parseInt(process.env.COUNT_SUBJECT_GROUPS_MAX, 10);
const COUNT_SUBJECT_GROUP_PHOTOS_MIN = parseInt(process.env.COUNT_SUBJECT_GROUP_PHOTOS_MIN, 10);
const COUNT_SUBJECT_GROUP_PHOTOS_MAX = parseInt(process.env.COUNT_SUBJECT_GROUP_PHOTOS_MAX, 10);
const COUNT_ORDERS = parseInt(process.env.COUNT_ORDERS, 10);
const COUNT_CONTACTS = parseInt(process.env.COUNT_CONTACTS, 10);
const COUNT_ORDER_ITEMS_MIN = parseInt(process.env.COUNT_ORDER_ITEMS_MIN, 10);
const COUNT_ORDER_ITEMS_MAX = parseInt(process.env.COUNT_ORDER_ITEMS_MAX, 10);
const COUNT_ORDER_PHOTO_SELECTION_MIN = parseInt(process.env.COUNT_ORDER_PHOTO_SELECTION_MIN, 10);
const COUNT_ORDER_PHOTO_SELECTION_MAX = parseInt(process.env.COUNT_ORDER_PHOTO_SELECTION_MAX, 10);
const COUNT_ORDER_GROUP_SELECTION_MIN = parseInt(process.env.COUNT_ORDER_GROUP_SELECTION_MIN, 10);
const COUNT_ORDER_GROUP_SELECTION_MAX = parseInt(process.env.COUNT_ORDER_GROUP_SELECTION_MAX, 10);
const COUNT_TRANSACTIONS = parseInt(process.env.COUNT_TRANSACTIONS, 10);

const FAKER_SEED = 4; // A random number
const CANADIAN_POSTAL_CODE = /[ABCEGHJ-NPRSTVXY][0-9][ABCEGHJ-NPRSTV-Z] [0-9][ABCEGHJ-NPRSTV-Z][0-9]/;

const memory: Record<string, any> = {};

function generatePureRandRandomizer(
    seed: number | number[] = Date.now() ^ (Math.random() * 0x100000000),
    factory: (seed: number) => RandomGenerator = xoroshiro128plus
): Randomizer {

    const self = {
        next: () => (self.generator.unsafeNext() >>> 0) / 0x100000000,
        seed: (seed: number | number[]) => {
            self.generator = factory(typeof seed === 'number' ? seed : seed[0]);
        },
    } as Randomizer & { generator: RandomGenerator };

    self.seed(seed);
    return self;
}

async function fakeBackgrounds(fakers: Fakers): Promise<void> {
    console.log('Faking the backgrounds now...');

    const { TransactionalBackground } = await import('../src/database/entities/transactional_background');
    const { TransactionalBackgroundCategory } =
        await import('../src/database/entities/transactional_background_category');
    const config = Container.get<ConfigSchema>('config');

    const categories: TransactionalBackgroundCategory[] = [];
    for (let i = 1; i <= COUNT_BACKGROUND_CATEGORIES; i++) {
        const category = new TransactionalBackgroundCategory();

        category.name_locale = {
            en: capitalize(fakers.en.word.sample()),
            fr: capitalize(fakers.fr.word.sample())
        };

        categories.push(category);
    }

    const categorySaveResults = await TransactionalBackgroundCategory.save(categories);
    const categoryIds = categorySaveResults.map(category => category.id);

    const backgrounds: TransactionalBackground[] = [];
    for (let i = 1; i <= COUNT_BACKGROUNDS; i++) {
        const imageUrl = fakers.en.image.urlLoremFlickr({
            width: config.app.photos.thumbnails.medium.portraitSize,
            height: config.app.photos.thumbnails.medium.landscapeSize,
            category: ['nature', 'landscape', 'scenery', 'monument', 'cityscape', 'architecture'][i % 6]
        });
        const imageData = await fetch(imageUrl).then(response => response.arrayBuffer());
        const imagePath = await getUniqueFilename(join(config.app.dirs.backgrounds, `background-.jpg`));
        const imageRelative = imagePath.slice(config.env.dirs.public.length + 1).replace(/\\/g, '/');
        const background = new TransactionalBackground();

        await writeFile(imagePath, Buffer.from(imageData));

        background.name_locale = {
            en: capitalize(fakers.en.word.sample()),
            fr: capitalize(fakers.fr.word.sample())
        };
        background.archived = fakers.general.datatype.boolean({ probability: 0.95 });
        background.categories = Array(fakers.general.number.int({ min: 1, max: 4 })).fill(0).map(
            () => fakers.general.number.int({
                min: categoryIds.reduce((acc, id) => Math.min(acc, parseInt(id, 10)), Number.MAX_SAFE_INTEGER),
                max: categoryIds.reduce((acc, id) => Math.max(acc, parseInt(id, 10)), Number.MIN_SAFE_INTEGER)
            }));
        background.featured = fakers.general.datatype.boolean({ probability: 0.05 });
        background.image = imageRelative;
        background.production_identifier = i;

        backgrounds.push(background);
    }

    await TransactionalBackground.save(backgrounds);
}

async function fakeWorkflows(fakers: Fakers): Promise<void> {
    console.log('Faking the workflows now...');

    const { TransactionalWorkflow } = await import('../src/database/entities/transactional_workflow');

    if (await TransactionalWorkflow.countBy({ internal_name: 'default' })) {
        memory.workflowId = (await TransactionalWorkflow.findOneOrFail({ where: { internal_name: 'default' } })).id;
    } else {
        const workflow = new TransactionalWorkflow();

        workflow.internal_name = 'default';
        workflow.options = {} as WorkflowOptions;
        memory.workflowId = (await workflow.save()).id;
    }
}

async function fakeDeliveries(fakers: Fakers): Promise<void> {
    console.log('Faking the deliveries now...');

    const { TransactionalDeliveryOption } = await import('../src/database/entities/transactional_delivery_option');
    const { TransactionalDeliveryOptionGroup } =
        await import('../src/database/entities/transactional_delivery_option_group');

    const uniqueGroupInternalName = new UniqueEnforcer();
    const groups: TransactionalDeliveryOptionGroup[] = [];
    for (let i = 1; i <= COUNT_DELIVERY_OPTION_GROUPS; i++) {
        const group = new TransactionalDeliveryOptionGroup();

        group.internal_name = uniqueGroupInternalName.enforce(() => fakers.general.word.sample());

        groups.push(group);
    }

    const groupSaveResults = await TransactionalDeliveryOptionGroup.save(groups);
    const groupIds = groupSaveResults.map(group => group.id);

    const uniqueOptionInternalName = new UniqueEnforcer();
    const options: TransactionalDeliveryOption[] = [];
    for (let i = 1; i <= COUNT_DELIVERY_OPTIONS; i++) {
        const option = new TransactionalDeliveryOption();

        option.internal_name = uniqueOptionInternalName.enforce(() => fakers.general.word.sample());
        option.name_locale = {
            en: capitalize(fakers.en.word.sample()),
            fr: capitalize(fakers.fr.word.sample())
        };
        option.base_price = fakers.general.number.float({ min: 0, max: 35 }).toString();
        option.lead_time = fakers.general.number.int({ min: 0, max: 14 });
        option.method = fakers.general.helpers.arrayElement(['fixed-rate', 'establishment', 'pick-up', 'canada-post']);

        switch (option.method) {
            case 'fixed-rate':
                option.options = null;
                break;

            case 'establishment':
                // eslint-disable-next-line no-case-declarations
                const etaDate = fakers.general.date.future({ years: 1 });
                // eslint-disable-next-line no-case-declarations
                const lateDate = fakers.general.date.future({ years: 1, refDate: etaDate });
                // eslint-disable-next-line no-case-declarations
                const expireDate = fakers.general.date.future({ years: 1, refDate: lateDate });

                option.options = {
                    etaDate,
                    lateDate,
                    expireDate,
                    lateFees: fakers.general.number.float({ min: 0, max: 25 })
                };
                break;

            case 'pick-up':
                option.options = {
                    contactPhone: fakers.general.phone.number(),
                    daysAvailable: fakers.general.helpers
                        .shuffle([0, 1, 2, 3, 4, 5, 6])
                        .slice(0, fakers.general.number.int({ min: 1, max: 7 }))
                        .sort(),
                    contactAddress: fakers.general.location.streetAddress()
                };
                break;

            case 'canada-post':
                option.options = {
                    envelopeEta: fakers.general.number.int({ min: 1, max: 14 }),
                    productCode: fakers.general.helpers.arrayElement(['DOM.EP', 'DOM.XP', 'DOM.PC', 'DOM.RP']),
                    envelopePrice: fakers.general.number.float({ min: 0, max: 25 }),
                    parcelThreshold: fakers.general.number.int({ min: 1, max: 5 }),
                    originPostalCode: fakers.general.helpers.fromRegExp(CANADIAN_POSTAL_CODE)
                };
                break;
        }

        options.push(option);
    }

    const optionSaveResults = await TransactionalDeliveryOption.save(options);
    const optionIds = optionSaveResults.map(option => option.id);

    for await (const group of groupSaveResults) {
        await TransactionalDeliveryOptionGroup.createQueryBuilder()
            .relation(TransactionalDeliveryOptionGroup, 'deliveryOptions')
            .of(group.id)
            .add(fakers.general.helpers.shuffle(optionIds).slice(0, fakers.general.number.int({ min: 1, max: 6 })));
    }

    memory.deliveryGroupIds = groupIds;
    memory.deliveryOptions = optionSaveResults;
}

async function fakeProducts(fakers: Fakers): Promise<void> {
    console.log('Faking the products now...');

    const { TransactionalProductCategory } = await import('../src/database/entities/transactional_product_category');
    const { TransactionalProduct } = await import('../src/database/entities/transactional_product');
    const { TransactionalProductThemeSet } = await import('../src/database/entities/transactional_product_theme_set');
    const { TransactionalProductCatalog } = await import('../src/database/entities/transactional_product_catalog');
    const { TransactionalProductTypeTheme } = await import('../src/database/entities/transactional_product_type_theme');
    const config = Container.get<ConfigSchema>('config');

    // Product theme sets
    const uniqueThemeSetInternalName = new UniqueEnforcer();
    const themeSets: TransactionalProductThemeSet[] = [];
    for (let i = 1; i <= COUNT_THEME_SETS; i++) {
        const themeSet = new TransactionalProductThemeSet();

        themeSet.internal_name = uniqueThemeSetInternalName.enforce(() => fakers.general.word.sample());
        themeSet.themes = Object.fromEntries(Array(fakers.general.number.int({ min: 1, max: 4 })).fill(0).map(() => ({
            en: capitalize(fakers.en.word.sample()),
            fr: capitalize(fakers.fr.word.sample())
        })).map((theme, index) => [`theme${index + 1}`, theme]));

        themeSets.push(themeSet);
    }
    const themeSetSaveResults = await TransactionalProductThemeSet.save(themeSets);

    // Product categories
    const uniqueCategoryInternalName = new UniqueEnforcer();
    const categories: TransactionalProductCategory[] = [];
    for (let i = 1; i <= COUNT_PRODUCT_CATEGORIES; i++) {
        const category = new TransactionalProductCategory();

        category.internal_name = uniqueCategoryInternalName.enforce(() => fakers.general.word.sample());
        category.name_locale = {
            en: capitalize(fakers.en.word.sample()),
            fr: capitalize(fakers.fr.word.sample())
        };
        category.priority = fakers.general.number.int({ min: 0, max: 10 });

        categories.push(category);
    }
    const categorySaveResults = await TransactionalProductCategory.save(categories);
    const categoryIds = categorySaveResults.map(category => category.id);

    // Product catalogs
    const uniqueCatalogInternalName = new UniqueEnforcer();
    const catalogs: TransactionalProductCategory[] = [];
    for (let i = 1; i <= COUNT_PRODUCT_CATALOGS; i++) {
        const catalog = new TransactionalProductCategory();

        catalog.internal_name = uniqueCatalogInternalName.enforce(() => fakers.general.word.sample());
        catalog.name_locale = {
            en: capitalize(fakers.en.word.sample()),
            fr: capitalize(fakers.fr.word.sample())
        };
        catalog.priority = fakers.general.number.int({ min: 0, max: 10 });

        catalogs.push(catalog);
    }
    const catalogSaveResults = await TransactionalProductCatalog.save(catalogs);
    const catalogIds = catalogSaveResults.map(catalog => catalog.id);

    // Products
    const uniqueProductInternalName = new UniqueEnforcer();
    const products: TransactionalProduct[] = [];
    const themeProductsData: { themeSetId: string, map: Record<string, string> }[] = [];
    for (let i = 1; i <= COUNT_PRODUCTS; i++) {
        const productType = fakers.general.helpers.arrayElement(
            ProductTypes.filter(type => !['touchup', 'digital', 'custom'].includes(type)));
        const product = new TransactionalProduct();
        const imageMap: Record<string, string> = {};
        let themeSetId: string | null = null;
        let imageUrls: string[] = [];
        let imageData: ArrayBuffer[] = [];
        let imagePaths: string[] = [];
        let imageRelatives: string[] = [];
        let imageCount = 1;

        if (productType === 'themed') {
            const themeSet = fakers.general.helpers.arrayElement(themeSetSaveResults);

            themeSetId = themeSet.id;
            imageCount = Object.values(themeSet.themes).length;
            themeProductsData[i - 1] = { themeSetId, map: {} };
        }

        imageUrls = Array(imageCount).fill(0).map(() => fakers.en.image.urlLoremFlickr({
            width: 400,
            height: 400,
            category: [
                'product,nature',
                'product,school',
                'product,science',
                'product,technology',
                'product,people',
                'product,objects'][i % 6]
        }));
        imageData = await Promise.all(imageUrls.map(url => fetch(url).then(response => response.arrayBuffer())));
        imagePaths = await Promise.all(imageData.map(() =>
            getUniqueFilename(join(config.app.dirs.products, `product-.jpg`))));
        imageRelatives = imagePaths.map(path => path.slice(config.env.dirs.public.length + 1).replace(/\\/g, '/'));

        for (let j = 0; j < imageCount; j++) {
            await writeFile(imagePaths[j], Buffer.from(imageData[j]));
            imageMap[`image${j + 1}`] = imageRelatives[j];
        }

        product.internal_name = uniqueProductInternalName.enforce(() => fakers.general.commerce.productName());
        product.name_locale = {
            en: capitalize(fakers.en.commerce.productName()),
            fr: capitalize(fakers.fr.commerce.productName())
        };
        product.archived = fakers.general.datatype.boolean({ probability: 0.05 });
        product.description_locale = {
            en: fakers.en.commerce.productDescription(),
            fr: fakers.fr.commerce.productDescription()
        };
        product.images = imageMap;
        product.options = {
            allowMix: fakers.general.datatype.boolean({ probability: 0.35 }),
            defaultImage: imageMap.image1,
            groupPhotoAllow: fakers.general.datatype.boolean({ probability: 0.5 }),
            groupPictureOnly: fakers.general.datatype.boolean({ probability: 0.15 }),
            priceScale: Array(fakers.general.number.int({ min: 1, max: 5 })).fill(0).map(() =>
                fakers.general.number.float({ min: 0, max: 1000 })),
            usePriceScale: fakers.general.datatype.boolean({ probability: 0.2 })
        };
        product.price = fakers.general.number.float({ min: 0, max: 1000 });
        product.priority = fakers.general.number.int({ min: 0, max: 10 });
        product.type = productType;
        product.weight = fakers.general.number.int({ min: 0, max: 750 });
        product.category = { id: fakers.general.helpers.arrayElement(categoryIds) } as TransactionalProductCategory;

        products.push(product);
    }
    const productSaveResults = await TransactionalProduct.save(products);

    const themeProducts: TransactionalProductTypeTheme[] = [];
    for await (const [index, product] of Object.entries(productSaveResults)) {
        await TransactionalProduct.createQueryBuilder()
            .relation(TransactionalProduct, 'catalogs')
            .of(product.id)
            .add(fakers.general.helpers.shuffle(catalogIds).slice(0, fakers.general.number.int({ min: 1, max: 6 })));

        if (themeProductsData[index]) {
            console.log('In theme');
            const themeProduct = new TransactionalProductTypeTheme();

            themeProduct.default_theme = null;
            themeProduct.themes_map = themeProductsData[index].map;
            themeProduct.product = { id: product.id } as TransactionalProduct;
            themeProduct.themeSet = { id: themeProductsData[index].themeSetId } as TransactionalProductThemeSet;

            themeProducts.push(themeProduct);
        }
    }
    const themeProductSaveResults = await TransactionalProductTypeTheme.save(themeProducts);

    for await (const themeProduct of themeProductSaveResults) {
        await TransactionalProduct.createQueryBuilder()
            .relation(TransactionalProduct, 'theme')
            .of(themeProduct.product.id)
            .set(themeProduct.id);
    }

    memory.catalogIds = catalogIds;
    memory.products = await TransactionalProduct.find({
        relations:
            ['category', 'catalogs', 'theme', 'theme.themeSet']
    });
}

async function fakeSessions(fakers: Fakers): Promise<void> {
    console.log('Faking the sessions now...');

    const { TransactionalSession } = await import('../src/database/entities/transactional_session');
    const { TransactionalSubject } = await import('../src/database/entities/transactional_subject');
    const { TransactionalSubjectGroup } = await import('../src/database/entities/transactional_subject_group');
    const config = Container.get<ConfigSchema>('config');

    const sessions: TransactionalSession[] = [];
    for (let i = 1; i <= COUNT_SESSIONS; i++) {
        const session = new TransactionalSession();
        const discountEnable = fakers.general.datatype.boolean({ probability: 0.5 });
        const digitalPrice = [fakers.general.number.float({ min: 1, max: 35 })];
        const digitalGroupPrice = [fakers.general.number.float({ min: 1, max: 35 })];

        session.internal_name = capitalize(fakers.en.company.name());
        session.archived = fakers.general.datatype.boolean({ probability: 0.15 });
        session.options = {
            color: {
                color1: fakers.general.color.rgb(),
                color2: fakers.general.color.rgb(),
                multipleColors: fakers.general.datatype.boolean({ probability: 0.5 })
            },
            digitalGroupPrice,
            digitalGroupPriceIsScaling: fakers.general.datatype.boolean({ probability: 0.2 }),
            digitalPrice,
            digitalPriceIsScaling: fakers.general.datatype.boolean({ probability: 0.2 }),
            digitalAutoSendEnable: fakers.general.datatype.boolean({ probability: 0.5 }),
            digitalGroupsEnable: fakers.general.datatype.boolean({ probability: 0.5 }),
            digitalEnable: fakers.general.datatype.boolean({ probability: 0.5 }),
            touchupsEnable: fakers.general.datatype.boolean({ probability: 0.5 }),
            touchupsPrice: [fakers.general.number.float({ min: 1, max: 35 })],
            touchupsPriceIsScaling: fakers.general.datatype.boolean({ probability: 0.2 }),
            discountEnable,
            discountCatalogId: fakers.general.helpers.shuffle(memory.catalogIds)[0] as string,
            discountPrices: [fakers.general.number.float({ min: 1, max: digitalPrice[0] })],
            discountGroupPrices: [fakers.general.number.float({ min: 1, max: digitalGroupPrice[0] })]
        };
        session.publish_date = fakers.general.date.soon({ days: 3 });
        session.expire_date = fakers.general.date.future({ years: 2, refDate: session.publish_date });
        session.workflow = { id: memory.workflowId } as TransactionalWorkflow;

        sessions.push(session);
    }
    const sessionSaveResults = await TransactionalSession.save(sessions);
    const sessionIds = sessionSaveResults.map(session => session.id);

    const uniqueSubjectCode = new UniqueEnforcer();
    const subjects: TransactionalSubject[] = [];
    const subjectGroups: TransactionalSubjectGroup[] = [];
    for await (const sessionId of sessionIds) {
        const photoCount = fakers.general.number.int({ min: COUNT_SUBJECT_PHOTOS_MIN, max: COUNT_SUBJECT_PHOTOS_MAX });
        const groupPhotoCount =
            fakers.general.number.int({ min: COUNT_SUBJECT_GROUP_PHOTOS_MIN, max: COUNT_SUBJECT_GROUP_PHOTOS_MAX });
        const groupCount = fakers.general.number.int({ min: COUNT_SUBJECT_GROUPS_MIN, max: COUNT_SUBJECT_GROUPS_MAX });
        const groups = Array(groupCount).fill(0).map(() => fakers.general.string.numeric({ length: 4 }));

        for (let i = 1; i <= fakers.general.number.int({ min: COUNT_SUBJECTS_MIN, max: COUNT_SUBJECTS_MAX }); i++) {
            const subject = new TransactionalSubject();
            const firstName = fakers.general.person.firstName();
            const lastName = fakers.general.person.lastName();
            const group = fakers.general.helpers.arrayElement(groups);
            const code = uniqueSubjectCode.enforce(
                () => fakers.general.string.alphanumeric({ length: 8, casing: 'upper' }));
            const uid = fakers.general.string.numeric({ length: 9 });
            const photoUrl = Array(photoCount).fill(0).map(() => fakers.general.image.urlLoremFlickr({
                width: 400,
                height: 500,
                category: ['student,kid,girl', 'student,kid,boy'][i % 2]
            }));
            const photoData = await Promise.all(
                photoUrl.map(url => fetch(url).then(response => response.arrayBuffer())));
            const photoPaths = await Promise.all(photoData.map(() => getUniqueFilename(
                join(config.app.dirs.sessionPhotos, `subject-.jpg`))));
            const photoRelatives = photoPaths.map(
                path => path.slice(config.env.dirs.public.length + 1).replace(/\\/g, '/'));

            for (let j = 0; j < photoCount; j++) {
                await writeFile(photoPaths[j], Buffer.from(photoData[j]));
            }

            subject.code = code;
            subject.group = group;
            subject.info = {
                firstName,
                lastName,
                group,
                code,
                uid,
                Nom: lastName,
                Prénom: firstName,
                Classe: group,
                Code: code,
                '# GPI': uid
            };
            subject.mappings = {
                firstName: "Prénom",
                lastName: "Nom",
                group: "Classe",
                code: "Code",
                uid: "# GPI"
            };
            subject.photos = photoRelatives;
            subject.unique_id = uid;
            subject.session = { id: sessionId } as TransactionalSession;

            subjects.push(subject);
        }

        for await (const groupName of groups) {
            const group = new TransactionalSubjectGroup();
            const photoUrl = Array(groupPhotoCount).fill(0).map(() => fakers.general.image.urlLoremFlickr({
                width: 500,
                height: 400,
                category: 'students,class'
            }));
            const photoData = await Promise.all(
                photoUrl.map(url => fetch(url).then(response => response.arrayBuffer())));
            const photoPaths = await Promise.all(photoData.map(() => getUniqueFilename(
                join(config.app.dirs.sessionPhotos, `group-.jpg`))));
            const photoRelatives = photoPaths.map(
                path => path.slice(config.env.dirs.public.length + 1).replace(/\\/g, '/'));

            for (let j = 0; j < groupPhotoCount; j++) {
                await writeFile(photoPaths[j], Buffer.from(photoData[j]));
            }

            group.group = groupName;
            group.photos = photoRelatives;
            group.session = { id: sessionId } as TransactionalSession;

            subjectGroups.push(group);
        }
    }
    const subjectSaveResults = await TransactionalSubject.save(subjects);
    const subjectGroupSaveResults = await TransactionalSubjectGroup.save(subjectGroups);

    for await (const sessionId of sessionIds) {
        await TransactionalSession.createQueryBuilder()
            .relation(TransactionalSession, 'productCatalogs')
            .of(sessionId)
            .add(fakers.general.helpers.shuffle(memory.catalogIds).slice(
                0, fakers.general.number.int({ min: 1, max: 6 })));

        await TransactionalSession.createQueryBuilder()
            .relation(TransactionalSession, 'deliveryGroups')
            .of(sessionId)
            .add(fakers.general.helpers.shuffle(memory.deliveryGroupIds).slice(
                0, fakers.general.number.int({ min: 1, max: 6 })));
    }

    memory.sessionIds = sessionIds;
    memory.subjectsBySession = subjectSaveResults.reduce((acc, subject) => {
        if (!acc[subject.session.id]) {
            acc[subject.session.id] = [];
        }
        acc[subject.session.id].push(subject);
        return acc;
    });
    memory.subjectGroupsBySession = subjectGroupSaveResults.reduce((acc, group) => {
        if (!acc[group.session.id]) {
            acc[group.session.id] = [];
        }
        acc[group.session.id].push(group);
        return acc;
    });
}

async function fakeOrders(fakers: Fakers): Promise<void> {
    console.log('Faking the orders now...');

    const { TransactionalOrder } = await import('../src/database/entities/transactional_order');
    const { TransactionalContact } = await import('../src/database/entities/transactional_contact');
    const { TransactionalTransaction } = await import('../src/database/entities/transactional_transaction');

    const contacts: TransactionalContact[] = [];
    for (let i = 1; i <= COUNT_CONTACTS; i++) {
        const contact = new TransactionalContact();

        contact.first_name = fakers.general.person.firstName();
        contact.last_name = fakers.general.person.lastName();
        contact.email = fakers.general.internet.email();
        contact.phone = fakers.general.phone.number();
        contact.street_address_1 = fakers.general.location.streetAddress();
        contact.street_address_2 = fakers.general.datatype.boolean({ probability: 0.6 }) ?
            fakers.general.location.secondaryAddress() : null;
        contact.city = fakers.general.location.city();
        contact.region = fakers.general.location.state();
        contact.postal_code = fakers.general.helpers.fromRegExp(CANADIAN_POSTAL_CODE);
        contact.country = 'Canada';
        contact.newsletter = fakers.general.datatype.boolean({ probability: 0.2 });

        contacts.push(contact);
    }
    const contactSaveResults = await TransactionalContact.save(contacts);
    const contactIds = contactSaveResults.map(contact => contact.id);

    const orderRelations: { subjects: TransactionalSubject[], groups: TransactionalSubjectGroup[] }[] = [];
    const orders: TransactionalOrder[] = [];
    for (let i = 1; i <= COUNT_ORDERS; i++) {
        const order = new TransactionalOrder();
        const sessionId: string = fakers.general.helpers.arrayElement(memory.sessionIds).toString();
        const deliveryOption: TransactionalDeliveryOption = fakers.general.helpers.arrayElement(memory.deliveryOptions);
        const paid: boolean = fakers.general.datatype.boolean({ probability: 0.85 });

        orderRelations[i] = {
            subjects: fakers.general.helpers.arrayElements(memory.subjectsBySession[sessionId], {
                min: COUNT_ORDER_PHOTO_SELECTION_MIN,
                max: COUNT_ORDER_PHOTO_SELECTION_MAX
            }),
            groups: fakers.general.helpers.arrayElements(memory.subjectGroupsBySession[sessionId], {
                min: COUNT_ORDER_GROUP_SELECTION_MIN,
                max: COUNT_ORDER_GROUP_SELECTION_MAX
            })
        };
        const subjectSelection = orderRelations[i].subjects;
        const groupSelection = orderRelations[i].groups;
        const selection = Object.fromEntries([...subjectSelection, ...groupSelection]
            .map(((selection, index) => {
                const url = fakers.general.helpers.arrayElement(selection.photos);
                return [`selection${index + 1}`, {
                    image: {
                        url,
                        subjectId: selection['unique_id'] ? selection.id : undefined,
                        subjectCode: selection['code'],
                        groupId: !selection['unique_id'] ? selection.id : undefined,
                        group: selection.group
                    },
                    background: null,
                    basenameUrl: url.slice(url.lastIndexOf('.')),
                    creation: new Date()
                }]
            }
            )));

        const cart: OrderCartItems = {};

        for (let j = 1; j <= fakers.general.number.int({ min: COUNT_ORDER_ITEMS_MIN, max: COUNT_ORDER_ITEMS_MAX }); j++) {
            const product: TransactionalProduct = fakers.general.helpers.arrayElement(memory.products);
            const quantity = fakers.general.number.int({ min: 1, max: 10 });
            const [themeId, themeLocale]: [string, LocalizedString] = product.type === 'themed'
                ? fakers.general.helpers.arrayElement(Object.entries(product.theme.themeSet.themes))
                : [null, null];
            const cartSelection = fakers.general.helpers.shuffle(
                Object.keys(selection)).slice(0, fakers.general.number.int({ min: 1, max: 4 }));

            const cartItem: OrderCartItem = {
                comment: fakers.general.datatype.boolean({ probability: 0.35 }) ? fakers.general.lorem.sentence() : '',
                customProductSelection: undefined,
                itemSubtotal: calculatePhysicalProduct(product, cartSelection.length, quantity),
                productId: product.id,
                productImage: Object.values(product.images)[0],
                productName: product.internal_name,
                productPrice: product.price,
                productType: product.type,
                quantity,
                selection: cartSelection,
                theme: themeId,
                themeId: themeId ? product.theme.themeSet.id : null,
                themeLocale: themeLocale
            };

            cart[`item${j}`] = cartItem;
        }

        const subtotal = Object.values(cart).reduce((sum, item) => sum + item.itemSubtotal, 0).toString();

        order.archived = fakers.general.datatype.boolean({ probability: 0.05 });
        order.cart = cart;
        order.comment = fakers.general.datatype.boolean({ probability: 0.35 })
            ? fakers.general.lorem.sentence().slice(0, 150)
            : '';
        order.flags = {
            customerLocale: fakers.general.helpers.arrayElement(['en', 'fr']),
            freeShipping: fakers.general.datatype.boolean({ probability: 0.15 }),
            promo: null,
            snapshot: {
                deliveryOption: {
                    id: deliveryOption.id,
                    internalName: deliveryOption.internal_name,
                    nameLocale: deliveryOption.name_locale,
                    basePrice: deliveryOption.base_price,
                    leadTime: deliveryOption.lead_time,
                    method: deliveryOption.method,
                    options: deliveryOption.options
                } as OrderSnapshot['deliveryOption']
            }
        };
        order.paid = paid;
        order.photo_selection = selection;
        order.sale_subtotal = subtotal;
        order.sale_delivery_price = deliveryOption.base_price;
        order.sale_taxes = {
            locality: 'ca-qc',
            canadian: {
                gst: (parseFloat(subtotal) * 0.05).toString(),
                pst: (parseFloat(subtotal) * 0.09975).toString()
            }
        }
        order.sale_total =
            subtotal + deliveryOption.base_price + order.sale_taxes.canadian.gst + order.sale_taxes.canadian.pst;
        order.contact = { id: fakers.general.helpers.arrayElement(contactIds) } as TransactionalContact;
        order.deliveryOption = { id: deliveryOption.id } as TransactionalDeliveryOption;
        order.session = { id: sessionId } as TransactionalSession;

        orders.push(order);
    }
    const orderSaveResults = await TransactionalOrder.save(orders);

    for await (const [index, order] of Object.entries(orderSaveResults)) {
        await TransactionalOrder.createQueryBuilder()
            .relation(TransactionalOrder, 'subjects')
            .of(order.id)
            .add(orderRelations[parseInt(index) + 1].subjects.map(subject => subject.id));

        await TransactionalOrder.createQueryBuilder()
            .relation(TransactionalOrder, 'subjectGroups')
            .of(order.id)
            .add(orderRelations[parseInt(index) + 1].groups.map(group => group.id));
    }

    const transactions: TransactionalTransaction[] = [];
    for (let i = 1; i <= COUNT_TRANSACTIONS; i++) {
        const transaction = new TransactionalTransaction();
        const order = orderSaveResults[i - 1];

        transaction.payment_module = fakers.general.helpers.arrayElement(['stripe', 'paypal', 'elavon', 'chase']);
        transaction.successful = order
            ? order.paid
            : false;
        transaction.transaction_code = fakers.general.string.alphanumeric({ length: 16 });
        transaction.processor_response = {
            status: '',
            message: '',
            transactionId: '',
            timestamp: new Date(),
            raw: ''
        };
        transaction.order = order
            ? order.id
            : null;

        transactions.push(transaction);
    }
    const transactionSaveResults = await TransactionalTransaction.save(transactions);
}

bootstrap([
    typediLoader,
    configLoader,
    typeormLoader
])
    .then(async () => {
        console.log('Fake it \'till you make it...');

        const randomizer = generatePureRandRandomizer();
        const fakers: Fakers = {
            general: new Faker({
                locale: [en_CA, en]
            }),
            en: new Faker({
                locale: [en_CA, en],
                randomizer
            }),
            fr: new Faker({
                locale: [fr_CA, fr],
                randomizer
            })
        };

        randomizer.seed(FAKER_SEED);

        await fakeBackgrounds(fakers);
        await fakeWorkflows(fakers);
        await fakeDeliveries(fakers);
        await fakeProducts(fakers);
        await fakeSessions(fakers);
        await fakeOrders(fakers);
    })
    .catch(error => {
        console.error('An error occurred:', error.message);
    });


/*
Truncate db for resetting:

TRUNCATE TABLE subjects RESTART IDENTITY CASCADE;
TRUNCATE TABLE subject_groups RESTART IDENTITY CASCADE;
TRUNCATE TABLE sessions RESTART IDENTITY CASCADE;
TRUNCATE TABLE product_catalogs RESTART IDENTITY CASCADE;
TRUNCATE TABLE products RESTART IDENTITY CASCADE;
TRUNCATE TABLE product_type_themes RESTART IDENTITY CASCADE;
TRUNCATE TABLE product_theme_sets RESTART IDENTITY CASCADE;
TRUNCATE TABLE product_categories RESTART IDENTITY CASCADE;
TRUNCATE TABLE subjects RESTART IDENTITY CASCADE;
TRUNCATE TABLE delivery_option_groups RESTART IDENTITY CASCADE;
TRUNCATE TABLE delivery_options RESTART IDENTITY CASCADE;
TRUNCATE TABLE contacts RESTART IDENTITY CASCADE;
TRUNCATE TABLE orders RESTART IDENTITY CASCADE;
TRUNCATE TABLE background_categories RESTART IDENTITY CASCADE;
TRUNCATE TABLE backgrounds RESTART IDENTITY CASCADE;
*/
