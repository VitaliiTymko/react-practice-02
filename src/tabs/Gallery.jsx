import { Component } from 'react';

import * as ImageService from 'service/image-service';
import { Button, SearchForm, Grid, GridItem, Text, CardItem } from 'components';

export class Gallery extends Component {
  state = {
    query: '',
    collection: [],
    error: null,
    page: 1,
    loading: false,
    visible: false,
    empty: false,
  };

  componentDidUpdate(_, prevState) {
    if (
      prevState.query !== this.state.query ||
      prevState.page !== this.state.page
    ) {
      this.apiRequest(this.state.query, this.state.page);
    }
  }

  apiRequest = async (query, page) => {
    this.setState({ loading: true });
    try {
      const {
        photos,
        page: currentPage,
        per_page,
        total_results,
      } = await ImageService.getImages(query, page);
      console.log(photos);
      if (photos.length === 0) {
        this.setState({ empty: true });
      }
      this.setState(prevState => ({
        collection: [...prevState.collection, ...photos],
        visible: currentPage < Math.ceil(total_results / per_page),
      }));
    } catch (error) {
      console.log(error);
      this.setState({ error: error });
    } finally {
      this.setState({ loading: false });
    }
  };

  handleSubmit = query => {
    this.setState({
      query: query,
      collection: [],
      error: null,
      page: 1,
      loading: false,
      visible: false,
      empty: false,
    });
  };

  handleLoadMore = () => {
    this.setState(prevState => ({ page: prevState.page + 1 }));
  };

  render() {
    const { collection } = this.state;

    return (
      <>
        <SearchForm onSubmit={this.handleSubmit} />
        {this.state.error && <Text>{this.state.error}</Text>}
        {this.state.empty && <Text>No images</Text>}
        <Grid>
          {collection.length > 0 &&
            collection.map(({ id, avg_color, alt, src }) => (
              <GridItem key={id}>
                <CardItem color={avg_color}>
                  <img src={src.large} alt={alt} />
                </CardItem>
              </GridItem>
            ))}
        </Grid>
        {this.state.visible && (
          <Button onClick={this.handleLoadMore} disabled={this.state.loading}>
            {this.state.loading ? 'Loading...' : 'Load more'}
          </Button>
        )}
      </>
    );
  }
}
