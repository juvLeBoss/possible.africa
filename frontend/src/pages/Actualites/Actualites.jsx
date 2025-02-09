// eslint-disable-next-line no-unused-vars
import { Box, Spinner, Text, VStack } from "@chakra-ui/react";
import CardComponent from "../../components/CardComponent.jsx";
import {
  useGetPostCategoriesQuery,
  useGetPostsQuery,
} from "../../features/api/apiSlice.js";
import CustomContainer from "../../utils/CustomContainer.jsx";
import { ParseSlice } from "../../utils/htmlParser.jsx";
import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import NoData from "../../utils/NoData.jsx";
import CenteredContainer from "../../utils/CenteredContainer.jsx";
import { NoMoreDataToLoad } from "../../components/noMoreDataToLoad.jsx";

function Actualites() {
  const [page, setPage] = useState(1);
  const [infiniteScrollIsFetching] = useState(false);
  const { data: interviewCategories = [] } = useGetPostCategoriesQuery({
    limit: 10,
    page: page,
    fields: [],
    eq: [{ field: "slug", value: "/actualites" }],
  });

  const {
    data: allNews = [],
    isLoading,
    isFetching,
    isError,
    isSuccess,
    error,
    refetch,
  } = useGetPostsQuery({
    limit: 10 * page,
    page: page,
    fields: [],
    eq: [
      { field: "categorie", value: `${interviewCategories[0]?._id}` },
      { field: "status", value: "published" },
    ],
  });

  const {
    data: allNewsLength,
    isLoading: allNewsLengthIsLoading,
    isFetching: allNewsLengthIsFetching,
    refetch: refechAllNewsLength,
  } = useGetPostsQuery({
    fields: [],
    eq: [
      { field: "categorie", value: `${interviewCategories[0]?._id}` },
      { field: "status", value: "published" },
    ],
  });

  useEffect(() => {
    // const allNewsLengthInterval = setInterval(() => {
    //   refechAllNewsLength();
    //   refetch();
    // }, 30000);
    if (allNewsLengthIsFetching) {
      // console.log("Loading...");
    }
    // console.log(allNewsLength);
    return () => {
      // return clearInterval(allNewsLengthInterval);
    };
  }, [allNewsLengthIsFetching, isFetching]);

  let content;

  let isLoaded = true;

  if (allNews?.length === 0) {
    if (isLoading || isFetching) {
      return (
        <Box
          as="div"
          display="flex"
          justifyContent="center"
          alignItems="center"
          p={15}
        >
          <Spinner />
        </Box>
      );
    }
    return <NoData />;
  }

  if (allNews.length) {
    content = (
      <InfiniteScroll
        dataLength={allNews.length}
        next={() => setPage((prevPage) => prevPage + 1)}
        hasMore={allNews.length === allNewsLength?.length ? false : true}
        loader={
          <Box
            styles={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Spinner as="div" mx="45%" mt={10} />
            {/* <p>{JSON.stringify(allNewsLength?)}</p> */}
          </Box>
        }
        endMessage={<NoMoreDataToLoad />}
      >
        {allNews &&
          allNews.map((news, index) => {
            const createdAt = new Date(news?.createdAt);
            // transform date to french format
            const date =
              createdAt.getDate() +
              "/" +
              (createdAt.getMonth() + 1) +
              "/" +
              createdAt.getFullYear();
            const instanceCard = (
              <CardComponent
                postType="Actualités"
                key={news?._id}
                title={news?.title}
                description={news?.content ? ParseSlice(news?.content) : null}
                imgUrl={news?.image}
                isLoaded={isLoaded}
                link={"/actualites/" + news?.slug}
                countries={news?.countries?.length > 0 ? news?.countries : []}
                authors={news?.authors?.length > 0 ? news?.authors : []}
                editors={news?.editors?.length > 0 ? news?.editors : []}
                hideMeBellow="md"
                organisations={
                  news?.organisations?.length > 0 ? news?.organisations : []
                }
                labels={news?.labels?.length > 0 ? news?.labels : []}
                createdAt={date}
                source={news?.source}
                language={news?.publication_language || "Français"}
              />
            );

            // if (index === allNews.length - 1) {
            //   setContinueDataLoading(false);
            // }

            return (
              <>
                {instanceCard}
                {/* {(index === allNews.length - 1 && infiniteScrollIsFetching) ?? (
                  <Box
                    as="div"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    p={15}
                  >
                    <Spinner />
                  </Box>
                )} */}
              </>
            );
          })}
      </InfiniteScroll>
    );
  }
  if (isError) {
    console.log({ error });
    return <Box>{error.status}</Box>;
  }

  return <CustomContainer content={content} />;
}

export default Actualites;
