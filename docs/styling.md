# Styling

All styling is done with [Sass](https://sass-lang.com/) using the `scss` syntax. We partly follow [atomic design](https://bradfrost.com/blog/post/atomic-web-design/) with reusable atoms and organisms.
React components have their own styling files in the same directory as the component and are imported and linked to elements using [classNames](https://github.com/JedWatson/classnames).

### Styling for Components 

React components have their own styling files in the same directory as the component itself. The styling is added to elements using [classNames](https://github.com/JedWatson/classnames):

```javascript
//components/comment/comment.js

// ...
// Styles
import styles from './comment.scss'

const css = classNames.bind(styles)

// ...

render {
  // ...
  return (
    <div className={css('comment')}>
  )
}
```

Here the div-element will get the styling specified for the class `header` in `comment.scss`.

### General

Base styling files that are imported into almost all other styling files are located in the [scss/](../client/src/scss)-folder. The folder contains:
- [Base](../client/src/scss/_base.scss)

   Universal styling for our feedbacker app
- [Colors](../client/src/scss/_colors.scss)

   Our color palette, for example `$palette-accent`
- [Functions](../client/src/scss/_functions.scss)

   For scss function
- [Mixins](../client/src/scss/_mixins.scss)

   For scss mixins
- [Typography](../client/src/scss/_typography.scss)

   The typography for the feedbacker app
- [Variables](../client/src/scss/_variables.scss)

   All the base variables for the feedbacker app, for example `$baseline` and `$spacer`


Some of these can be imported as one from the [compulsory](../client/src/scss/_compulsory.scss) file:
```scss
@import '../../scss/compulsory';
```

It imports `colors`, `functions`, `mixins`, `and variables`. If needed, typography needs to be imported separately.

### [Atoms](../client/src/scss/atoms/)

The atoms directory contains small basic reusable styling parts. Atoms can be styling for simple elements like inputs or buttons.
These can and should be used in organisms and components to make it easier to make changes to for example all buttons.

### [Organisms](../client/src/scss/organisms)

Organisms are for bigger components like forms which might use multiple atoms.

