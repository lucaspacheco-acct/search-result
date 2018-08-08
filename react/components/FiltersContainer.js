import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { NoSSR } from 'render'
import { isMobile } from 'react-device-detect'

import SelectedFilters from './SelectedFilters'
import AvailableFilters from './AvailableFilters'
import AccordionFilterContainer from './AccordionFilterContainer'
import { findInTree, mountOptions } from '../constants/SearchHelpers'
import { facetOptionShape, paramShape } from '../constants/propTypes'

const CATEGORIES_TYPE = 'Categories'
const BRANDS_TYPE = 'Brands'
const PRICE_RANGES_TYPE = 'PriceRanges'
const SPECIFICATION_FILTERS_TYPE = 'SpecificationFilters'
const CATEGORIES_TITLE = 'search.filter.title.categories'
const BRANDS_TITLE = 'search.filter.title.brands'
const PRICE_RANGES_TITLE = 'search.filter.title.price-ranges'

export default class FiltersContainer extends Component {
  static propTypes = {
    getLinkProps: PropTypes.func.isRequired,
    tree: PropTypes.arrayOf(facetOptionShape),
    params: paramShape,
    brands: PropTypes.arrayOf(facetOptionShape),
    specificationFilters: PropTypes.arrayOf(facetOptionShape),
    priceRanges: PropTypes.arrayOf(facetOptionShape),
    map: PropTypes.string,
    rest: PropTypes.string,
  }

  get categories() {
    const { tree, params } = this.props
    if (!tree || tree.length === 0) {
      return []
    }
    const [{ Children: children }] = tree
    const categories = Object.values(params).filter(category => category)
    const category = findInTree(tree, categories, 0)
    if (category) {
      return category.Children || children
    }
    return children || []
  }

  get selectedFilters() {
    const {
      brands,
      specificationFilters,
      priceRanges,
      map,
      rest,
    } = this.props

    const categories = this.categories

    let options = []

    options = options.concat(mountOptions(categories, CATEGORIES_TYPE, map, rest))
    options = options.concat(specificationFilters.map(spec =>
      mountOptions(spec.facets, SPECIFICATION_FILTERS_TYPE, map, rest)
    ))
    options = options.concat(mountOptions(brands, BRANDS_TYPE, map, rest))
    options = options.concat(mountOptions(priceRanges, PRICE_RANGES_TYPE, map, rest))

    return options.filter(opt => opt.selected)
  }

  render() {
    const {
      specificationFilters,
      brands,
      priceRanges,
      map,
      rest,
      getLinkProps,
    } = this.props
    const categories = this.categories

    const filters = []

    if (categories.length) {
      filters.push({
        type: CATEGORIES_TYPE,
        title: CATEGORIES_TITLE,
        options: categories,
        oneSelectedCollapse: true,
      })
    }

    filters.concat(specificationFilters.map(spec => ({
      type: SPECIFICATION_FILTERS_TYPE,
      title: spec.name,
      options: spec.facets,
    })))

    filters.push({
      type: BRANDS_TYPE,
      title: BRANDS_TITLE,
      options: brands,
    })

    filters.push({
      type: PRICE_RANGES_TYPE,
      title: PRICE_RANGES_TITLE,
      options: priceRanges,
    })

    if (isMobile) {
      return (
        <NoSSR onSSR={null}>
          <AccordionFilterContainer filters={filters} />
        </NoSSR>
      )
    }

    // The NoSSR component is needed because we don't have the user-agent
    // string while doing server-side rendering
    return (
      <NoSSR onSSR={null}>
        <SelectedFilters
          selecteds={this.selectedFilters}
          getLinkProps={getLinkProps}
        />
        <AvailableFilters
          getLinkProps={getLinkProps}
          filters={filters}
          map={map}
          rest={rest}
        />
      </NoSSR>
    )
  }
}
