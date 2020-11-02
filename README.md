# React Leaflet Locator

# Inject script for dev notes

Injection is using the `build-scripts` command. It is using the inject script inside of `scripts/inject`. Currently testing with `test.html`. The purpose of this is to be injectable into any vanilla html project via script tag and data set html tag. Test the `test.html` inside the `dist` folder once it's done building.

# Example usage

```html
<html>
  <h2>Hello World</h2>
  <body>
    <div data-locator-container></div> <!-- This must have the data attribute 'data-locator-container'. This is where the map will be injected. -->
  </body>
  <script type="text/javascript" src="https://map-inject.netlify.app/bundle.js"></script>
  <script>
    const TestInject = window.TestInject
    new TestInject({...locatorData}) // pass data through here example of data below.
  </script>
</html>
```

For example data reference [here](https://github.com/tbaustin/react-leaflet-locator/blob/master/test-data.js). Currently you must format the data to exactly match or else things will not work. This can be changed in the future