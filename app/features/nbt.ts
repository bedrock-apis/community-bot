import { Buffer } from "node:buffer";

export enum NBTTag{
    "EndOfCompoud" = 0,
    "Byte" = 1,
    "Int16" = 2,
    "Int32" = 3,
    "Int64" = 4,
    "Float" = 5,
    "Double" = 6,
    "ByteArray" = 7,
    "String" = 8,
    "TypedList" = 9,
    "Compoud" = 10
}
export enum SNBTKinds {
    "b"=NBTTag.Byte,
    "s"=NBTTag.Int16,
    "i"=NBTTag.Int32,
    "l"=NBTTag.Int64,
    "f"=NBTTag.Float,
    "d"=NBTTag.Double
}
export const NUMBER_SIZES = {
    [NBTTag.Byte]: 1,
    [NBTTag.Int16]: 2,
    [NBTTag.Int32]: 4,
    [NBTTag.Int64]: 8,
    [NBTTag.Float]: 4,
    [NBTTag.Double]: 8,
}
class Stream{
    offset: number;
    readonly buffer;
    constructor(buffer: Buffer, offset: number){
        this.buffer = buffer;
        this.offset = offset??0;
    }
    readByte(){return this.buffer.readUInt8(this.offset++);}
    readInt16LE(){
        const value = this.buffer.readInt16LE(this.offset);
        this.offset += 2;
        return value;
    }
    readInt32LE(){
        const value = this.buffer.readInt32LE(this.offset);
        this.offset += 4;
        return value;
    }
    readInt64LE(){
        const value = this.buffer.readBigInt64LE(this.offset);
        this.offset += 8;
        return value;
    }
    readUInt16LE(){
        const value = this.buffer.readUInt16LE(this.offset);
        this.offset += 2;
        return value;
    }
    readUInt32LE(){
        const value = this.buffer.readUInt32LE(this.offset);
        this.offset += 4;
        return value;
    }
    readUInt64LE(){
        const value = this.buffer.readBigUInt64LE(this.offset);
        this.offset += 8;
        return value;
    }
    readFloatLE(){
        const value = this.buffer.readFloatLE(this.offset);
        this.offset += 4;
        return value;
    }
    readDoubleLE(){
        const value = this.buffer.readDoubleLE(this.offset);
        this.offset += 8;
        return value;
    }
    writeByte(value: number){ this.buffer.writeUInt8(value,this.offset++);}
    writeInt16LE(value: number){
        const length = this.buffer.writeInt16LE(value,this.offset);
        this.offset += 2;
        return length;
    }
    writeInt32LE(value: number){
        const length = this.buffer.writeInt32LE(value,this.offset);
        this.offset += 4;
        return length;
    }
    writeInt64LE(value: bigint){
        const length = this.buffer.writeBigInt64LE(value,this.offset);
        this.offset += 8;
        return length;
    }
    writeUInt16LE(value: number){
        const length = this.buffer.writeUInt16LE(value,this.offset);
        this.offset += 2;
        return length;
    }
    writeUInt32LE(value: number){
        const length = this.buffer.writeUInt32LE(value,this.offset);
        this.offset += 4;
        return length;
    }
    writeUInt64LE(value: bigint){
        const length = this.buffer.writeBigUInt64LE(value,this.offset);
        this.offset += 8;
        return length;
    }
    writeFloatLE(value: number){
        const length = this.buffer.writeFloatLE(value,this.offset);
        this.offset += 4;
        return length;
    }
    writeDoubleLE(value: number){
        const length = this.buffer.writeDoubleLE(value,this.offset);
        this.offset += 8;
        return length;
    }
}
class NBTValue<T = any> {
    value: T;
    readonly type: NBTTag
    constructor(type: NBTTag, value: T){
        this.value = value;
        this.type = type;
    }
    get byteLength(){return 0;}
    toSNBT(space?: string, count?: number){return "";}
    toString(){return this.toSNBT()}
}
export class CompoudValue extends NBTValue<{[K: string]: NBTValue}>{
    constructor(value: {[K: string]: NBTValue}){
        super(NBTTag.Compoud,value??{});
    }
    get(key: string){return this.value[key];}
    set(key: string, value: NBTValue){return this.value[key] = value;}
    has(key: string){return key in this.value;}
    *keys(){yield * Object.getOwnPropertyNames(this.value);}
    *values(){ for(const k of Object.getOwnPropertyNames(this.value)) yield this.value[k]; }
    *entries():Generator<[string, NBTValue<any>]> { for(const k of Object.getOwnPropertyNames(this.value)) yield [k,this.value[k]]; }
    [Symbol.iterator] = this.entries;
    forEach(callback: (key: string, value: NBTValue, that: this)=>void){for(const [key,value] of this.entries()) callback(key,value,this);}
    get byteLength(){
        let a = 0;
        for (const [k,v] of this) {
            a += 1 + 2 + Buffer.from(k,"utf8").byteLength + v.byteLength;
        }
        return a + 1;
    }
    get size(){return Object.getOwnPropertyNames(this.value).length;}
    toSNBT(space?: string, count: number = 1): string{
        if(this.size === 0) return "{}";
        if(space) {
            let a = "{";
            let add = false;
            for (const [key,value] of this) {
                if(add) a+=",";
                a+="\n" + space.repeat(count) + key + ": " + value.toSNBT(space,count+1);
                add = true;
            }
            return a + "\n" + space.repeat(count - 1) + "}";
        }
        else return "{" + [...this].map(([k,v])=>k + ": " + v.toSNBT()).join(",") + "}";
    }
}
export class TypedArrayValue<T> extends NBTValue<NBTValue<T>[]>{
    readonly arrayType;
    constructor(v: NBTValue<T>[], type: NBTTag){
        super(NBTTag.TypedList, v);
        this.arrayType = type;
    }
    add(v: NBTValue<T>){
        if(v instanceof NBTValue) return v;
        return this;
    }
    remove(index: number){
        ArrayRemove(this.value,index);
    }
    set(index: number, value: NBTValue){
        if(value instanceof NBTValue) return this.value[index] = value;
        return this;
    }
    get length(){
        return this.value.length;
    }
    clear(){this.value = [];}
    get byteLength(){
        let a = 0;
        for (const obj of this.value) a += obj.byteLength;
        return a + 4 + 1;
    }
    toSNBT(space = "", count = 1){
        if(this.length === 0) return "[]";
        if(space) {
            let a = "[";
            let add = false;
            for (const v of this.value) {
                if(add) a+=",";
                a+="\n" + space.repeat(count) + v.toSNBT(space,count+1);
                add = true;
            }
            return a + "\n" + space.repeat(count - 1) + "]";
        }
        else return "[" + this.value.map(a=>a.toSNBT(space+space)).join(",") + "]";
    }
    *[Symbol.iterator](){yield * this.value;}
}
class NumericValue<T extends number | bigint = number> extends NBTValue<T>{
    constructor(type: NBTTag, value: T){
        super(type,value);
    }
    valueOf(){return Number(this.value);}
    get numberType(){return SNBTKinds[this.type];}
    get byteLength(){return NUMBER_SIZES[this.type as 1];}
    toSNBT(){return "" + this.value + this.numberType;}
}
export class Uint8ArrayValue extends NBTValue{
    constructor(buffer: Buffer){super(NBTTag.ByteArray,buffer);}
    set(buffer: Buffer){this.value = buffer;}
    get(){return this.value;}
    get byteLength(){return this.value.byteLength + 4;}
    toSNBT(){return "'" + [...new Uint8Array(this.value)].map((v)=>{let a = v.toString(16);return a.length>1?a:"0" + a}).join(" ") + "'";}
}
export class StringValue extends NBTValue<string>{ 
    constructor(v: string){super(NBTTag.String,v)}; 
    valueOf(){return this.value;}; 
    setValue(v: string){this.value = "" + v}; 
    getValue(){return this.value;}; 
    get length(){return this.value.length}
    get byteLength(){return Buffer.from(this.value,"utf8").byteLength + 2;}
    toSNBT(){return JSON.stringify(this.value)}
}
export class ByteValue extends NumericValue{ constructor(v: number){super(NBTTag.Byte,v)}; }
export class Int16Value extends NumericValue{ constructor(v: number){super(NBTTag.Int16,v)}; }
export class Int32Value extends NumericValue{ constructor(v: number){super(NBTTag.Int32,v)}; }
export class Int64Value extends NumericValue<bigint>{ constructor(v: bigint){super(NBTTag.Int64,v)}; }
export class FloatValue extends NumericValue{ constructor(v: number){super(NBTTag.Float,v)}; }
export class DoubleValue extends NumericValue{ constructor(v: number){super(NBTTag.Double,v)}; }
function ArrayRemove(array: any[],index: number,removeNumber = 1){return array.slice(0,index).concat(array.slice(index + removeNumber));}
export class NBTFile{

    /**@private */
    private value;
    /**@private */
    private header;
    name;
    constructor(value: NBTValue, name: string = "", hasHeader: number = 0){
        this.value = value;
        this.name = name;
        this.header = hasHeader;
    }
    setHeader(version: number = 0){
        this.header = version;
    }
    get type(){return this.value.type;}
    /**@readonly */
    get hasHeader(){return this.header>0;}
    /**@readonly */
    get headerVersion(){return this.header;}
    /**@readonly */
    get byteLength(){return (this.header?8:0) + 3 + Buffer.from(this.name,"utf8").byteLength + this.value.byteLength;}
    toSNBT(space = ""){return this.value.toSNBT(space)}
    toString(){return this.toSNBT()}
    static Read(buffer: Buffer){
        const headerVersion = NBTFile.GetHeaderVersion(buffer);
        const stream = new Stream(buffer,headerVersion?8:0);
        const type = stream.readByte();
        const fileName = Raw_NBT_Readers[NBTTag.String](stream);
        return new NBTFile(NBT_Readers[type as 1](stream) as any,fileName,headerVersion);
    }
    /**@returns {any} @param {Buffer} buffer*/
    static ReadRaw(buffer: Buffer){
        const headerVersion = NBTFile.GetHeaderVersion(buffer);
        const stream = new Stream(buffer,headerVersion?8:0);
        const type = stream.readByte();
        const skip = stream.readInt16LE();
        stream.offset += skip;
        return Raw_NBT_Readers[type as 1](stream);
    }
    /**@returns {Buffer} @param {NBTFile} file @param {Buffer |undefined} buffer */
    static Write(file: NBTFile, buffer: Buffer){
        const byteSize = file.byteLength; 
        buffer = buffer??Buffer.alloc(byteSize);
        if(buffer.byteLength < byteSize) throw new RangeError("Buffer size is not low, can't not save this NBTFile");
        if(file.hasHeader){
            buffer.writeInt16LE(file.headerVersion,0);
            buffer.writeInt16LE(byteSize - 8,4);
        }
        const stream = new Stream(buffer,file.hasHeader?8:0);
        stream.writeByte(file.value.type);
        NBT_Writers[NBTTag.String](stream,{value:file.name??""} as StringValue);
        NBT_Writers[file.value.type as 1](stream, file.value as any);
        return buffer;
    }
    /**@returns {boolean} @param {Buffer} buffer*/
    static HasHeader(buffer: Buffer){return buffer.readInt32LE(4) + 8 === buffer.byteLength;}
    /**@returns {number} @param {Buffer} buffer*/
    static GetHeaderVersion(buffer: Buffer){return NBTFile.HasHeader(buffer)?buffer.readInt32LE(4):0;}
}

const Raw_NBT_Readers = {
    [NBTTag.Compoud](myStream: Stream){
        const compoud = {} as any;
        while(true){
            const readType = Raw_NBT_Readers.readType(myStream);
            if(readType === NBTTag.EndOfCompoud) return compoud as {[K: string]: any};
            const keyName = Raw_NBT_Readers[NBTTag.String](myStream);
            const value = Raw_NBT_Readers[readType as 1](myStream);
            compoud[keyName] = value;
        }
    },
    [NBTTag.TypedList](myStream: Stream): any[]{
        const readType = Raw_NBT_Readers.readType(myStream);
        const readLength = myStream.readInt32LE();
        const array = [];
        for (let i = 0; i < readLength; i++) array.push(Raw_NBT_Readers[readType as 1](myStream));
        return array as any[];
    },
    [NBTTag.ByteArray](myStream: Stream){
        const buffer = new Uint8Array(myStream.readInt32LE());
        myStream.buffer.copy(buffer,0,myStream.offset,myStream.offset + buffer.length);
        myStream.offset += buffer.length;
        return buffer;
    },
    [NBTTag.String](myStream: Stream){
        const buffer = Buffer.alloc(myStream.readInt16LE());
        myStream.buffer.copy(buffer,0,myStream.offset,myStream.offset + buffer.byteLength);
        myStream.offset += buffer.byteLength;
        return buffer.toString("utf8");
    },
    readType(myStream: Stream){
        return myStream.readByte();
    },
    [NBTTag.Byte](myStream: Stream){return myStream.readByte();},
    [NBTTag.Int16](myStream: Stream){return myStream.readInt16LE();},
    [NBTTag.Int32](myStream: Stream){return myStream.readInt32LE();},
    [NBTTag.Int64](myStream: Stream){return myStream.readInt64LE();},
    [NBTTag.Float](myStream: Stream){return myStream.readFloatLE();},
    [NBTTag.Double](myStream: Stream){return myStream.readDoubleLE();}
}
const NBT_Readers = {
    [NBTTag.Compoud](myStream: Stream, type?: NBTTag){
        const compoud = new CompoudValue({});
        while(true){
            const readType = NBT_Readers.readType(myStream);
            if(readType === NBTTag.EndOfCompoud) return compoud;
            const keyName = NBT_Readers[NBTTag.String](myStream,NBTTag.String);
            const value = NBT_Readers[readType as 1](myStream,readType);
            compoud.set("" + keyName, value);
        }
    },
    [NBTTag.TypedList](myStream: Stream, type?: NBTTag){
        const readType = NBT_Readers.readType(myStream);
        const readLength = myStream.readInt32LE();
        const array = [];
        for (let i = 0; i < readLength; i++) array.push(NBT_Readers[readType as 1](myStream,readType));
        return new TypedArrayValue(array,readType);
    },
    [NBTTag.ByteArray](myStream: Stream, type?: NBTTag){
        const buffer = Buffer.alloc(myStream.readInt32LE());
        myStream.buffer.copy(buffer,0,myStream.offset,myStream.offset + buffer.length);
        myStream.offset += buffer.length;
        return new Uint8ArrayValue(buffer);
    },
    [NBTTag.String](myStream: Stream, type?: NBTTag){
        const buffer = Buffer.alloc(myStream.readInt16LE());
        myStream.buffer.copy(buffer,0,myStream.offset,myStream.offset + buffer.byteLength);
        myStream.offset += buffer.byteLength;
        return new StringValue(buffer.toString("utf8"));
    },
    readType(myStream: Stream){
        return myStream.readByte();
    },
    [NBTTag.Byte](myStream: Stream, type?: NBTTag){return new NumericValue(type??NBTTag.Byte,myStream.readByte());},
    [NBTTag.Int16](myStream: Stream, type?: NBTTag){return  new NumericValue(type??NBTTag.Int16,myStream.readInt16LE());},
    [NBTTag.Int32](myStream: Stream, type?: NBTTag){return  new NumericValue(type??NBTTag.Int32,myStream.readInt32LE());},
    [NBTTag.Int64](myStream: Stream, type?: NBTTag){return  new NumericValue(type??NBTTag.Int64,myStream.readInt64LE());},
    [NBTTag.Float](myStream: Stream, type?: NBTTag){return  new NumericValue(type??NBTTag.Float,myStream.readFloatLE());},
    [NBTTag.Double](myStream: Stream, type?: NBTTag){return  new NumericValue(type??NBTTag.Double,myStream.readDoubleLE());}
}
const NBT_Writers = {
    [NBTTag.Compoud](myStream: Stream, value: CompoudValue){
        for (const [key,v] of value) {
            const type = v.type;
            myStream.writeByte(type);
            const length = myStream.buffer.write(key,myStream.offset + 2,"utf8");
            myStream.writeInt16LE(length);
            myStream.offset += length;
            NBT_Writers[type as 1](myStream, v as any);
        }
        myStream.writeByte(NBTTag.EndOfCompoud);
    },
    [NBTTag.TypedList](myStream: Stream, value: TypedArrayValue<NBTTag>){
        const {length,arrayType} = value;
        myStream.writeByte(arrayType);
        myStream.writeInt32LE(length);
        for(const v of value) NBT_Writers[arrayType as 1](myStream,v as any);
    },
    [NBTTag.ByteArray](myStream: Stream, value: Uint8ArrayValue){
        const buffer = Buffer.from(value.value.buffer);
        myStream.writeInt32LE(value.byteLength);
        buffer.copy(myStream.buffer,myStream.offset);
    },
    [NBTTag.String](myStream: Stream, value: StringValue){
        const length = myStream.buffer.write(value.value,myStream.offset + 2,"utf8");
        myStream.writeInt16LE(length);
        myStream.offset += length;
    },
    [NBTTag.Byte](myStream: Stream, value: ByteValue){ myStream.writeByte(value.value)},
    [NBTTag.Int16](myStream: Stream, value: Int16Value){myStream.writeInt16LE(value.value)},
    [NBTTag.Int32](myStream: Stream, value: Int32Value){myStream.writeInt32LE(value.value)},
    [NBTTag.Int64](myStream: Stream, value: Int64Value){myStream.writeInt64LE(value.value)},
    [NBTTag.Float](myStream: Stream, value: FloatValue){myStream.writeFloatLE(value.value)},
    [NBTTag.Double](myStream: Stream, value: DoubleValue){myStream.writeDoubleLE(value.value)}
}