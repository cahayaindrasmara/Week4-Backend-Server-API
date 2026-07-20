const getPagination = (page = 1, size = 10) => {
    const currentPage = Math.max(Number(page) || 1, 1);
    const pageSize = Math.max(Number(size) || 10, 1);

    return {
        page: currentPage,
        size: pageSize,
        skip: (currentPage - 1) * pageSize,
        take: pageSize
    }
}

export default getPagination;