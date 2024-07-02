const Router = require("koa-router");
const { analyticsClient } = require("../ga4/ga4TokenHandler");

const propertyId = "442833303";

const router = new Router({
  prefix: "/ga4/analytics",
});

router.get("/users", async (ctx) => {
  try {
    const [response] = await analyticsClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: "2024-03-01", endDate: "today" }],
      dimensions: [{ name: "country" }],
      metrics: [{ name: "activeUsers" }, { name: "newUsers" }],
    });

    ctx.body = response;
  } catch (error) {
    console.error("Error in /api/analytics/users:", error);
    ctx.status = error.response ? error.response.status : 500;
    ctx.body = {
      message: error.response ? error.response.data : "Internal Server Error",
    };
  }
});

router.get("/traffic", async (ctx) => {
  try {
    const [response] = await analyticsClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: "2024-03-01", endDate: "today" }],
      dimensions: [{ name: "sourceMedium" }],
      metrics: [{ name: "sessions" }, { name: "bounceRate" }],
    });

    ctx.body = response;
  } catch (error) {
    console.error("Error in /api/analytics/traffic:", error);
    ctx.status = error.response ? error.response.status : 500;
    ctx.body = {
      message: error.response ? error.response.data : "Internal Server Error",
    };
  }
});

router.get("/pages", async (ctx) => {
  try {
    const [response] = await analyticsClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: "2024-03-01", endDate: "today" }],
      dimensions: [{ name: "pageTitle" }],
      metrics: [
        { name: "screenPageViews" },
        { name: "averageSessionDuration" },
      ],
    });

    ctx.body = response;
  } catch (error) {
    console.error("Error in /api/analytics/pages:", error);
    ctx.status = error.response ? error.response.status : 500;
    ctx.body = {
      message: error.response ? error.response.data : "Internal Server Error",
    };
  }
});

router.get("/events", async (ctx) => {
  try {
    const [response] = await analyticsClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: "2024-03-01", endDate: "today" }],
      dimensions: [{ name: "eventName" }],
      metrics: [{ name: "engagementRate" }, { name: "eventCount" }],
    });

    ctx.body = response;
  } catch (error) {
    console.error("Error in /api/analytics/events:", error);
    ctx.status = error.response ? error.response.status : 500;
    ctx.body = {
      message: error.response ? error.response.data : "Internal Server Error",
    };
  }
});

module.exports = router;
