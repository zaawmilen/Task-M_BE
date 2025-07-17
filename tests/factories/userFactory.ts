// tests/factories/userFactory.ts
import { faker } from '@faker-js/faker';

export const createFakeUser = (overrides = {}) => {
  return {
    name: faker.person.fullName(), 
    email: faker.internet.email(),
    password: faker.internet.password({ length: 12 }),
    ...overrides,
  };
};
