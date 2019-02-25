import { configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

require('@babel/polyfill')

configure({ adapter: new Adapter() })
