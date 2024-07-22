function detectLevelUp(
    target: Character,
    methodName: string,
    descriptor: PropertyDescriptor,
): PropertyDescriptor {
    const originalMethod = descriptor.value;
    return {
        value: async function (...args: Array<unknown>) {},
    };
}

export { detectLevelUp };
