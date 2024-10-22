export const parseEnv = (searchArg: string) => {
    const args = process.argv.slice(2);

    for (const arg of args) {
        if (arg.startsWith(searchArg)) {
            return arg.split('=')[1];
        }
    }
    return null;
};
