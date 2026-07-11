import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { prisma } from "../../lib/prisma";

const generateSlug = (name: string) => {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
};

const createCategoryIntoDB = async (payload: { name: string }) => {
    const existingCategory = await prisma.category.findFirst({
        where: {
            name: {
                equals: payload.name,
                mode: "insensitive",
            },
        },
    });

    if (existingCategory) {
        throw new AppError(
            httpStatus.CONFLICT,
            `Category with name "${payload.name}" already exists`
        );
    }

    const slug = generateSlug(payload.name);

    const existingSlug = await prisma.category.findUnique({
        where: { slug },
    });

    if (existingSlug) {
        throw new AppError(
            httpStatus.CONFLICT,
            `Category with a similar name already exists`
        );
    }

    const category = await prisma.category.create({
        data: {
            name: payload.name,
            slug,
        },
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
    const category = await prisma.category.findUnique({
        where: {
            id,
        },
    });

    if (!category) {
        throw new AppError(httpStatus.NOT_FOUND, "Category not found");
    }

    return category;
};


const updateCategoryIntoDB = async (
    id: string,
    payload: {
        name?: string;
    }
) => {
    const existingCategory = await prisma.category.findUnique({
        where: { id },
    });

    if (!existingCategory) {
        throw new AppError(httpStatus.NOT_FOUND, "Category not found");
    }

    const updateData: { name?: string; slug?: string } = {};

    if (payload.name) {
        const duplicateCategory = await prisma.category.findFirst({
            where: {
                name: {
                    equals: payload.name,
                    mode: "insensitive",
                },
                id: { not: id },
            },
        });

        if (duplicateCategory) {
            throw new AppError(
                httpStatus.CONFLICT,
                `Category with name "${payload.name}" already exists`
            );
        }

        updateData.name = payload.name;
        updateData.slug = generateSlug(payload.name);
    }

    const category = await prisma.category.update({
        where: {
            id,
        },
        data: updateData,
    });

    return category;
};


const deleteCategoryFromDB = async (id: string) => {
    const existingCategory = await prisma.category.findUnique({
        where: { id },
    });

    if (!existingCategory) {
        throw new AppError(httpStatus.NOT_FOUND, "Category not found");
    }

    const linkedGearItem = await prisma.gearItem.findFirst({
        where: { categoryId: id },
    });

    if (linkedGearItem) {
        throw new AppError(
            httpStatus.CONFLICT,
            "This category cannot be deleted because it has gear items linked to it"
        );
    }

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