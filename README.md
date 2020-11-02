# React Leaflet Locator

# Inject script for dev notes

Injection is using the `build-scripts` command. It is using the inject script inside of `scripts/inject`. Currently testing with `test.html`. The purpose of this is to be injectable into any vanilla html project via script tag and data set html tag. Test the `test.html` inside the `dist` folder once it's done building.

# Example usage

```html
<html>
  <h2>Test Stand Alone Dealer Page</h2>
  <body>
    <div data-locator-container></div> <!-- This must have the data attribute 'data-locator-container'. This is where the map will be injected. -->
  </body>
 <script type="text/javascript" src="./bundle.js"></script>
  <script>
    const TestInject = window.TestInject
    new TestInject()
  </script>
</html>
```