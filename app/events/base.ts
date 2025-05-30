export class CustomEvent<T> {
    protected methods: Set<(eventData: T)=>void> = new Set();
    public subscribe<M extends (eventData: T)=>void>(method: M): M{
        this.methods.add(method);
        return method;
    }
    public unsubscribe<M extends (eventData: T)=>void>(method: M): M{
        this.methods.delete(method);
        return method;
    }
    public trigger(data: T): void{
        for(const method of this.methods) method(data);
    }
}