import app from '../../app';  // This import will cover Line 22

describe('app', () => {
  it('should export an Express app', () => {
    expect(app).toBeDefined();
    expect(app.use).toBeDefined();  // Verify it's an Express app
  });
});