import Class from "../models/class.js"

const myCustomLabels = {
    totalDocs: 'totalItems',
    docs: 'items',
    limit: 'perPage',
    page: 'currentPage',
    hasNextPage: false,
    hasPrevPage: false,
    nextPage: false,
    prevPage: false,
    totalPages: 'pageCount',
    pagingCounter: false,
    meta: 'paging',
};

export const getOneClass = async (filterQuery) => {
    let theClass = await Class.findOne(filterQuery)
    if (!theClass) throw { status: "error", code: 404, message: "Class not found" }

    return theClass
}

export const getMany = async (filterQuery, pageFilter) => {
    pageFilter.customLabels = myCustomLabels

    return await Class.paginate(filterQuery, pageFilter)
}

export const createClass = async (data) => {
    let theClass = await Class.findOne({ title: data.title })
    if (theClass) throw {status: "error", code: 400, message: `${data.title} already exist`}

    const newClass = new Class ({
        title: data.title,
        description: data.description
    })

    await newClass.save()
    return newClass
}

export const updateClass = async (theClass, data) => {
    theClass.title = data.title || theClass.title
    theClass.description = data.description || theClass.description

    await theClass.save()
    return theClass
}

export const deleteClass = async(filterQuery) => {
    const theClass = await getOneClass(filterQuery)

    await theClass.deleteOne(filterQuery)
    return theClass
}

