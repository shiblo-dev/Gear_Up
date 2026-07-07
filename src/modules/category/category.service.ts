import { prisma } from "../../lib/prisma";


const createCategoryIntoDB = async (payload: {
    name: string;
}) => {
    const category = await prisma.category.create({
        data: payload as any,
    });

    return category;
};


const getAllCategoriesFromDB = async () => {
    const categories = await prisma.category.findMany({
        orderBy: {
            createdAt: "desc",
        },
    });

    return categories;
};


const getSingleCategoryFromDB = async (id: string) => {
    const category = await prisma.category.findUniqueOrThrow({
        where: {
            id,
        },
    });

    return category;
};


const updateCategoryIntoDB = async (
    id: string,
    payload: {
        name: string;
    }
) => {
    const category = await prisma.category.update({
        where: {
            id,
        },
        data: payload,
    });

    return category;
};


const deleteCategoryFromDB = async (id: string) => {
    const category = await prisma.category.delete({
        where: {
            id,
        },
    });

    return category;
};


export const categoryService = {
    createCategoryIntoDB,
    getAllCategoriesFromDB,
    getSingleCategoryFromDB,
    updateCategoryIntoDB,
    deleteCategoryFromDB,
};