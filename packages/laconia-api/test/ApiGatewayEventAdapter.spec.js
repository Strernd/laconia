const ApiGatewayEventAdapter = require("../src/ApiGatewayEventAdapter");

describe("ApiGatewayEventAdapter", () => {
  let event;
  let inputConverter;
  let outputConverter;
  let app;
  let constructorArgs;
  let laconiaContext;

  beforeEach(() => {
    event = { foo: "event" };
    inputConverter = { convert: jest.fn().mockResolvedValue({ payload: "" }) };
    outputConverter = {
      convert: jest.fn().mockResolvedValue({
        body: '{"status":"ok"}',
        headers: { "content-type": "application/json" },
        statusCode: 200
      })
    };
    app = jest.fn();
    constructorArgs = [app, inputConverter, outputConverter, false];
    laconiaContext = { laconia: "context" };
  });

  it("should return the output converter returned result", async () => {
    app.mockResolvedValue({ status: "ok" });
    const adapter = new ApiGatewayEventAdapter(...constructorArgs);
    const result = await adapter.handle(event, laconiaContext);
    expect(result).toEqual(
      expect.objectContaining({
        body: '{"status":"ok"}',
        headers: { "content-type": "application/json" },
        statusCode: 200
      })
    );
  });

  it("should call app with the converted event payload", async () => {
    inputConverter.convert.mockResolvedValue({ payload: "converted value" });
    const adapter = new ApiGatewayEventAdapter(...constructorArgs);
    await adapter.handle(event, laconiaContext);
    expect(app).toBeCalledWith("converted value", laconiaContext);
  });

  it("should call the app with headers parameter when headers option is set to true", async () => {
    inputConverter.convert.mockResolvedValue({
      payload: "converted value",
      headers: { header1: "value1" }
    });
    const adapter = new ApiGatewayEventAdapter(
      app,
      inputConverter,
      outputConverter,
      true
    );
    await adapter.handle(event, laconiaContext);
    expect(app).toBeCalledWith(
      "converted value",
      { header1: "value1" },
      laconiaContext
    );
  });

  it("should be able to be called like function", async () => {
    app.mockResolvedValue({ status: "ok" });
    const adapter = new ApiGatewayEventAdapter(...constructorArgs);
    const result = await adapter.toFunction()(event, laconiaContext);
    expect(result).toEqual(
      expect.objectContaining({
        statusCode: 200
      })
    );
  });
});
