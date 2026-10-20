import fs from 'fs/promises';

const fileRemoverMiddleware = async (filePath: string): Promise<void> => {
    try {
        await fs.access(filePath);
        await fs.unlink(filePath);
    } catch (err: unknown) {
        if (err && typeof err === 'object' && 'code' in err && err.code === 'ENOENT') {
            return;
        }
        throw err;
    }
};

export default fileRemoverMiddleware;