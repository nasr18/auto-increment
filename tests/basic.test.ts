import { getModelForClass, modelOptions, plugin, prop } from '@typegoose/typegoose';
import * as mongoose from 'mongoose';
import { AutoIncrementID, AutoIncrementIDOptions, AutoIncrementSimple, AutoIncrementSimplePluginOptions } from '../src/autoIncrement';
import { connect, disconnect } from './utils/mongooseConnect';

describe('Basic Suite', () => {
  beforeAll(async () => {
    await connect();
  });

  afterAll(async () => {
    await disconnect();
  });

  describe('AutoIncrementSimple', () => {
    it('Basic Function Mongoose', async () => {
      const schema = new mongoose.Schema({
        somefield: Number
      });
      schema.plugin(AutoIncrementSimple, [{ field: 'somefield' }]);
      const model = mongoose.model('AutoIncrementSimple-SomeModel', schema);

      const doc: mongoose.Document & { somefield: number; } = await model.create({ somefield: 10 }) as any;
      expect(doc.somefield).toBe(10);

      await doc.save();
      expect(doc.somefield).toBe(11);
    });

    it('Basic Function Typegoose', async () => {
      @plugin<AutoIncrementSimplePluginOptions>(AutoIncrementSimple, [{ field: 'someIncrementedField' }])
      @modelOptions({ options: { customName: 'AutoIncrementSimple-SomeClass' } })
      class SomeClass {
        @prop({ required: true })
        public someIncrementedField: number;
      }

      const SomeModel = getModelForClass(SomeClass);

      const doc = await SomeModel.create({ someIncrementedField: 10 });
      expect(doc.someIncrementedField).toBe(10);

      await doc.save();
      expect(doc.someIncrementedField).toBe(11);
    });
  });

  describe('AutoIncrementID', () => {
    it('Basic Function Mongoose', async () => {
      const schema = new mongoose.Schema({
        _id: Number,
        somefield: Number
      });
      schema.plugin(AutoIncrementID, {});
      const model = mongoose.model('AutoIncrementID-SomeModel', schema);

      const doc: mongoose.Document & { somefield: number; } = await model.create({ somefield: 10 }) as any;
      expect(doc.somefield).toBe(10);
      expect(doc._id).toBe(0);

      await doc.save();
      expect(doc.somefield).toBe(10);
      expect(doc._id).toBe(0);

      expect(mongoose.connection.model('identitycounter')).not.toBeUndefined();
    });

    it('Basic Function Typegoose', async () => {
      @plugin<AutoIncrementIDOptions>(AutoIncrementID, {})
      @modelOptions({ options: { customName: 'AutoIncrementID-SomeClass' } })
      class SomeClass {
        @prop()
        public _id: number;

        @prop({ required: true })
        public someIncrementedField: number;
      }

      const SomeModel = getModelForClass(SomeClass);

      const doc = await SomeModel.create({ someIncrementedField: 10 });
      expect(doc.someIncrementedField).toBe(10);
      expect(doc._id).toBe(0);

      await doc.save();
      expect(doc.someIncrementedField).toBe(10);
      expect(doc._id).toBe(0);

      expect(mongoose.connection.model('identitycounter')).not.toBeUndefined();
    });

    it('Basic Function Mongoose With startAt', async () => {
      const schema = new mongoose.Schema({
        _id: Number,
        somefield: Number
      });
      schema.plugin(AutoIncrementID, { startAt: 2 });
      const model = mongoose.model('AutoIncrementID-SomeModelStartAt', schema);

      const doc: mongoose.Document & { somefield: number; } = await model.create({ somefield: 10 }) as any;
      expect(doc.somefield).toBe(10);
      expect(doc._id).toBe(2);

      await doc.save();
      expect(doc.somefield).toBe(10);
      expect(doc._id).toBe(2);

      expect(mongoose.connection.model('identitycounter')).not.toBeUndefined();
    });

    it('Basic Function Typegoose With startAt', async () => {
      @plugin<AutoIncrementIDOptions>(AutoIncrementID, { startAt: 5 })
      @modelOptions({ options: { customName: 'AutoIncrementID-SomeClassStartAt' } })
      class SomeClass {
        @prop()
        public _id: number;

        @prop({ required: true })
        public someIncrementedField: number;
      }

      const SomeModel = getModelForClass(SomeClass);

      const doc = await SomeModel.create({ someIncrementedField: 20 });
      expect(doc.someIncrementedField).toBe(20);
      expect(doc._id).toBe(5);

      await doc.save();
      expect(doc.someIncrementedField).toBe(20);
      expect(doc._id).toBe(5);

      expect(mongoose.connection.model('identitycounter')).not.toBeUndefined();
    });
  });
});

describe('Errors', () => {
  it('should Error if the schema path does not exist', () => {
    const schema = new mongoose.Schema({});
    expect(() => schema.plugin(AutoIncrementSimple, { field: 'SomeNonExistingField' })).toThrow(Error);
  });

  it('should Error if the schema path is not an number', () => {
    const schema = new mongoose.Schema({
      nonNumberField: String
    });
    expect(() => schema.plugin(AutoIncrementSimple, { field: 'nonNumberField' })).toThrow(Error);
  });
});
