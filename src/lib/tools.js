export const thunkSucceed = (response) => {
    return response?.type?.includes("fulfilled");
}