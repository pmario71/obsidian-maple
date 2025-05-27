class TestClass {
    private _test : string;

    public get test() : string {
        return this._test;
    }

    public set test(v : string) {
        this._test = v;
    }
    
}

describe('TestClass', () => {
    it('should get and set test property correctly', () => {    
        const instance = new TestClass();
        instance.test = 'Hello, World!';

        expect(instance.test).toBe('Hello, World!');
    }
    );
});