import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { ImSpinner2 } from 'react-icons/im';
import { MdRefresh } from 'react-icons/md';
import ReactPaginate from 'react-paginate';
import { useNavigate } from 'react-router-dom';
import empty from '../../assets/images/undraw_no-data.png';

const NewTable = forwardRef(
  (
    { decorator, thClasses = '', api, item_details_url, emptyMsg, title = null, searchTerm = '', searchBy, stateName },
    ref,
  ) => {
    const [isloading, setIsloading] = useState(true);
    const [tableData, setTableData] = useState();
    const [CurrentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate();

    const [searchResult, setSearchResult] = useState([]);

    // the below function helps to directly traverse the hierarchy of objects to find a value regardless the depth
    const findprop = (obj, path) => {
      var args = path.split('.'),
        i,
        l;
      for (i = 0, l = args.length; i < l; i++) {
        if (!obj.hasOwnProperty(args[i])) return;
        obj = obj[args[i]];
      }
      return obj;
    };

    // function below formats a table cell into dateTime using moment if the data item is a dateTime type of data
    const formatIfDateObject = (item) => {
      if (typeof item === 'boolean') {
        return JSON.stringify(item);
      } else if (typeof item === 'number' || typeof item === 'undefined' || item === null) {
        return item;
      } else {
        return item;
      }
    };

    const handlePageChange = (pageIndex) => {
      const currenPageIndex = pageIndex.selected + 1;
      setCurrentPage(currenPageIndex);
    };
    async function handleApi(p = null) {
      setIsloading(true);
      try {
        const res = await api({
          PageNumber: p ?? CurrentPage,
          PageSize: 10,
          // FromDate: StartDate,
          // ToDate: EndDate,
        });
        setTableData(res);
        setIsloading(false);
      } catch (error) {
        console.log(error);
      }
    }
    useEffect(() => {
      handleApi();
    }, [CurrentPage]);

    useEffect(() => {
      if (searchTerm?.length >= 1) {
        const result = searchBy
          ? tableData?.data?.filter((item) => item[searchBy]?.toLowerCase().includes(searchTerm?.toLowerCase()))
          : tableData?.data?.filter((item) => item?.reference?.toLowerCase().includes(searchTerm?.toLowerCase()));
        setSearchResult(result);
      } else {
        setSearchResult(tableData?.data);
      }
    }, [searchTerm, tableData?.data]);
    useImperativeHandle(ref, () => ({
      handleApi: handleApi,
    }));

    const handleRefresh = () => {
      setCurrentPage(1);
      handleApi(1);
    };

    return (
      <>
        <div className="flex justify-between">
          <div>
            <span className="font-bold text-lg ">{title ?? ''}</span>
          </div>
          <span onClick={() => handleRefresh()} className="border border-md rounded py-2 px-4 shadow">
            <MdRefresh size={22} color="black" />
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full table-auto border-separate border-spacing-y-3 ">
            <thead>
              <tr className="!text-left !opacity-70 !font-semibold">
                {decorator.map((item, i) => (
                  <th key={i} className={`text-sm py-3 border-y !font-semibold ${thClasses}`}>
                    {item.label}
                  </th>
                ))}
                {/* {actions && <th className="text-danger"><i><b>Actions</b></i></th>} */}
              </tr>
            </thead>
            {!isloading && tableData?.data?.length > 0 && (
              <tbody>
                {searchResult?.map((res, i) => {
                  return (
                    <tr
                      key={i}
                      className="cursor-pointer pt-3 transition-all duration-300 shadow-sm hover:shadow-md bg-white mb-2"
                      onClick={
                        item_details_url
                          ? () =>
                              navigate(item_details_url, {
                                state: { id: res.id, [stateName]: res },
                              })
                          : null
                      }
                    >
                      {decorator.map((item, idx) =>
                        item.Cell
                          ? item.Cell(formatIfDateObject(findprop(res, item.accessor)), res, idx)
                          : formatIfDateObject(findprop(res, item.accessor)),
                      )}

                      {/* {actions &&
                                    <td>
                                      <span className="actions">
                                        <span className="table-icon-wrapper before success_span_text">
                                          <Pencil size={15.4} />
                                        </span>
                                        <span className="table-icon-wrapper before primary_span_text">
                                          <Archive size={15.4} />
                                        </span>

                                        <span className="table-icon-wrapper danger_span_text">
                                          <XCircle size={15.4} />
                                        </span>
                                      </span>
                                    </td>
                                  } */}
                    </tr>
                  );
                })}
              </tbody>
            )}
          </table>
          {!isloading && tableData?.data?.length == 0 && !searchTerm ? (
            <div className="py-20 flex flex-col justify-center items-center">
              <img className="w-32" src={empty} alt="no data" />
              <p className=" font-medium  flex justify-center">{emptyMsg ?? 'No data found'} </p>
            </div>
          ) : null}
          {!isloading && searchTerm && searchResult?.length == 0 ? (
            <div className="py-5 flex flex-col justify-center items-center">
              <p className=" font-medium  flex justify-center">{'No Search Result.'} </p>
            </div>
          ) : null}
          {isloading && (
            <div className="py-24 flex items-center gap-1 justify-center text-sm p-2  font-medium">
              <ImSpinner2 className="animate-spin" />
              <p>Loading</p>
            </div>
          )}
          <div className="w-full flex justify-center mt-2">
            {!isloading && tableData?.data?.length > 0 && (
              <ReactPaginate
                breakClassName={'page-item'}
                breakLinkClassName={'page-link'}
                containerClassName={'flex justify-center'}
                pageClassName={'w-8 h-8 flex justify-center items-center font-semibold text-primary rounded-md '}
                pageLinkClassName={''}
                previousClassName={'w-8 h-8 flex justify-center items-center font-semibold text-primary rounded-md'}
                previousLinkClassName={'text-sm'}
                nextClassName={'w-8 h-8 flex justify-center items-center font-semibold text-primary rounded-md'}
                nextLinkClassName={'text-sm'}
                activeClassName={'bg-gray-300'}
                initialPage={tableData?.meta?.page - 1}
                // pageRangeDisplayed={RequestRes.pageCount}
                prevRel={tableData?.meta?.hasPreviousPage ? true : null}
                nextRel={tableData?.meta?.hasNextPage ? true : null}
                pageCount={tableData?.meta?.pageCount}
                pageRangeDisplayed={tableData.meta?.pageCount}
                onPageChange={handlePageChange}
                previousLabel={''}
                nextLabel={''}
              />
            )}
          </div>
        </div>
      </>
    );
  },
);
export default NewTable;
