// This is a standalone component that can be used to search for NFTs on a network.
// You can copy and paste this component into your project and to add a search bar for NFTs.
// This compoennt can only be used within a thirdweb project.
// Review the index.tsx file for the full example implementation of the NFTSearcher component.
import React, { useState, useEffect, useMemo } from 'react';
import {
    useNFTs,
    useContract,
    MediaRenderer,
} from "@thirdweb-dev/react";

type Styling = {
    searchContainer: React.CSSProperties;
    searchBarContainer: React.CSSProperties;
    networkImage: React.CSSProperties;
    searchBar: React.CSSProperties;
    clearButton: React.CSSProperties;
    suggestionsContainer: React.CSSProperties;
    suggestion: React.CSSProperties;
    suggestionLogo: React.CSSProperties;
  };

export interface SearchBarProps {
    activeNetwork?: string;
    limit?: number;
    start?: number;
    theme?: string;
    onNFTsFetched?: (nfts: any[]) => void;
    classNames?: {
        searchBarContainer?: string;
        selectNetwork?: string;
        searchBar?: string;
        searchBarMatic?: string;
        clearButton?: string;
        suggestionsContainer?: string;
        suggestion?: string;
        suggestionLogo?: string;
    };
}

export interface Collection {
    name?: string;
    contract?: string;
    image?: string;
    symbol?: string;
}


export interface Collections {
    [key: string]: Collection[];
}

export const NFTSearcher = ({
    activeNetwork, 
    limit, 
    start,
    theme, 
    onNFTsFetched, 
    classNames = {
        searchBarContainer: "",
        selectNetwork: "",
        searchBar: "",
        searchBarMatic: "",
        clearButton: "",
        suggestionsContainer: "",
        suggestion: "",
        suggestionLogo: "",
    }}:SearchBarProps) => {
  const [contractAddress, setContractAddress] = useState<string>('');
  const [twContractAddress, setTWContractAddress] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [collectionCache, setCollectionCache] = useState<Collections>({});
  const [lastUsedContractAddress, setLastUsedContractAddress] = useState<string>('');
  onNFTsFetched = onNFTsFetched || (() => {});

  // Styling and theme
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const darkTheme = useMemo(() => theme === 'dark', [theme]);
  const styling: Styling = {
    searchContainer: {
        position: 'relative',
        display: 'inline-block',
      },
      searchBarContainer: {
        display: 'flex',
        marginLeft: 'auto',
        marginRight: 'auto',
        justifySelf: 'center',
        width: '350px',
        border: '3px solid #ccc',
        borderRadius: '13px',
        boxSizing: 'border-box',
        height: '63.5px',
        position: 'relative',
        backgroundColor: darkTheme ? '#1f1f1f' : '#fff',
        color: darkTheme ? '#fff' : '#000',
        outline: 'none',
      },
      networkImage: {
        marginLeft: '10px',
        marginTop: '12px',
        marginRight: '0px',
        width: '30px',
      },
      searchBar: {
        height: '100%',
        width: '100%',
        flex: 1,
        fontSize: '20px',
        borderRadius: '12px',
        backgroundColor: darkTheme ? '#1f1f1f' : '#fff',
        padding: '12px 20px 12px 10px',
        alignItems: 'center',
        justifySelf: 'center',
        border: 'none',
        cursor: 'pointer',
        color: darkTheme ? '#fff' : '#000',
        outline: 'none',
      },
      clearButton: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#ccc',
        fontSize: '1.5em',
        backgroundColor: 'rgba(231, 232, 232, 0.407)',
        width: '60px',
        borderTopRightRadius: '8px',
        borderBottomRightRadius: '8px',
      },
      suggestionsContainer: {
        position: 'absolute',
        left: 0,
        top: '68px',
        justifySelf: 'center',
        borderRadius: '12px',
        width: '350px',
        padding: '12px 20px',
        marginLeft: 'auto',
        marginRight: 'auto',
        cursor: 'pointer',
        flex: 1,
        backgroundColor: darkTheme ? '#1f1f1f' : '#fff',
        color: darkTheme ? '#fff' : '#000',
      },
      suggestion:{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '8px',
        marginTop: '8px',
      },
      suggestionLogo: {
        width: '24px',
        height: '24px',
        backgroundColor: darkTheme ? '#1f1f1f' : '#fff',
        color: darkTheme ? '#fff' : '#000',
      },
  };

  // Active Network
 const network = useMemo(() => {
    return activeNetwork || 'ethereum';
    }, [activeNetwork]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const search = e.target.value;
        setContractAddress(search);
        setShowSuggestions(search !== '');
    };
    
    const handleClearSearch = () => {
        setContractAddress('');
        setShowSuggestions(false);
    };
    
    const { contract } = useContract(twContractAddress);
    const {data: nfts} = useNFTs(contract,{
        count: limit,
        start: start,
    });

    useEffect(() => {
        if (nfts && nfts.length > 0 && onNFTsFetched) {
            onNFTsFetched(nfts);
            setIsProcessing(false);
        } else {
            setIsProcessing(false);
            console.log('No NFTs found');
        }
        setShowSuggestions(false);
    }, [nfts, onNFTsFetched]);

    const handleSuggestionClick = (search: string) => {
        console.log('Setting last used contract address...');
        setLastUsedContractAddress(search);
        setTWContractAddress(search || lastUsedContractAddress);
        setIsProcessing(true);
        setContractAddress('');
        setShowSuggestions(false);
    };
    
    

    // Directory
    useEffect(() => {
        const fetchCollections = async () => {
            // Check cache first
            const cache = collectionCache[network];
            if (cache) {
            setCollections([]);
            setCollections((prevCollections) => [
                ...prevCollections,
                ...(Array.isArray(cache) ? cache : []),
            ]);
            return;
            }

            // Fetch from server or within the app to get collection suggestions
            // For in app directory. Structure your directory as follows:
            // [
            //     {
            //       "contract": "0x8f170F73076b7A45749677B1681b13366B3C80f7",
            //       "name": "Hexagonal Zero",
            //       "symbol": "HEXZ",
            //       "image": "ipfs://QmeV9C1VmJDJ7jCLy8GUwqhrRRj3VVxzood31pEyyWZtnw/001.png"
            //     }
            // ]
            // If you would like to use the locatia directory, you can use the following code.
            // If your collection is not in the locatia directory, open an issue on the locatia directory github to request your collection be added.

            try {
                let url;
                switch (network) {
                    case "ethereum":
                        url = "https://lib.locatia.app/eth-directory/thirdweb.json";
                        break;
                    case "polygon":
                        url = "https://lib.locatia.app/poly-directory/thirdweb.json";
                        break;
                    case "fantom":
                        url = "https://lib.locatia.app/ftm-directory/thirdweb.json";
                        break;
                    case "avalanche":
                        url = "https://lib.locatia.app/avax-directory/thirdweb.json";
                        break;
                    case "frame-testnet":
                        url = "https://lib.locatia.app/frame-testnet/thirdweb.json";
                        break;
                    default:
                        url = "https://lib.locatia.app/eth-directory/thirdweb.json";
                }
        
                const response = await fetch(url);
                if (!response.ok) {
                    console.log('Error: URL returned no content');
                } else {
                    const data = await response.json();
                    if (data === null || data === undefined) {
                        console.log('Error: Invalid JSON data received from server');
                    } else {
                        setCollections(data);
                        setCollectionCache({ ...collectionCache, [network]: data });
                    }
                }
            } catch (error) {
                console.error(`Suggestions: ${error}`);
            }
        };
        fetchCollections();
   
    }, [network, collectionCache]);

    
  return (
    <div 
        style={styling.searchContainer}
        >
        <div 
            className={`${classNames.searchBarContainer || ""}`} 
            style={styling.searchBarContainer}
        >
            {network === "ethereum" ? (
                // network icons for search bar can be added here. for example, ethereum, polygon, fantom, avalanche, frame-testnet.
                // suggestions for NFTs on a network will require a directory of NFTs on that network.
                <MediaRenderer 
                    style={styling.networkImage}
                    src="https://bafybeie3c5fcqjhrfma6wljpwzzldpsttu2lonutagoxwikeslersqzdwe.ipfs.dweb.link/eth.png"
                    alt="ethereum"
                    width={"30px"} 
                    height={"30px"}
                />
            ) : network === "polygon" ? (
                <MediaRenderer 
                style={styling.networkImage}
                    src="https://bafybeigzgztdmt3qdt52wuhyrrvpqp5qt4t2uja23wmfhsccqt332ek7da.ipfs.dweb.link/polygon/512.png"
                    alt="polygon"
                    width={"30px"} 
                    height={"30px"}
                />
            ) : network === "fantom" ? (
                <MediaRenderer 
                    style={styling.networkImage}
                    src="https://bafybeigzgztdmt3qdt52wuhyrrvpqp5qt4t2uja23wmfhsccqt332ek7da.ipfs.dweb.link/fantom/512.png"
                    alt="fantom"
                    width={"30px"} 
                    height={"30px"}
                />
            ) : network === "avalanche" ? (
                <MediaRenderer 
                    style={styling.networkImage}
                    src="https://bafybeigzgztdmt3qdt52wuhyrrvpqp5qt4t2uja23wmfhsccqt332ek7da.ipfs.dweb.link/avalanche/512.png"
                    alt="avalanche"
                    width={"30px"} 
                    height={"30px"}
                />
             ) : network === "frame-testnet" ? (
                    <MediaRenderer 
                        src="https://5830d53ec6e6754ea216cead1b68e681.ipfscdn.io/ipfs/bafybeibvzodeiunfwwkffke35wcrgup2gcc6rn4izzt3u74xcstf74k3o4/"
                        alt="frametestnet"
                        width={"30px"} 
                        height={"30px"}
                        style={{ borderRadius: "50%", ...styling.networkImage }}
                    />
            ) : (
                <MediaRenderer 
                    style={styling.networkImage}
                    src="https://bafybeie3c5fcqjhrfma6wljpwzzldpsttu2lonutagoxwikeslersqzdwe.ipfs.dweb.link/eth.png"
                    alt="ethereum"
                    width={"30px"} 
                    height={"30px"}
                />
            )    
            }
            <input
                style={styling.searchBar}
                className={`${classNames.searchBar || ""}`}
                type="text"
                value={contractAddress}
                placeholder={isProcessing ? "searching..." : "Name/Contract Address"}
                onChange={handleInputChange}
                onKeyPress={event => {
                    if (event.key === 'Enter' && contractAddress) {
                        handleSuggestionClick(contractAddress);
                        };
                    }}
                disabled={isProcessing}
            />
            {contractAddress && (
            <button 
                style={styling.clearButton}
                className={`${classNames.clearButton || ""}`} 
                onClick={handleClearSearch} 
                aria-label="Clear search"
            >
                X
            </button>
            )}
        </div>
        {showSuggestions && (
        <div
            style={styling.suggestionsContainer}
            className={`${classNames.suggestionsContainer || ""} `}
        >
            {collections && collections.length > 0 ? 
                collections
                .filter((collection) =>
                {return collection.name && collection.name.toLowerCase().includes(contractAddress.toLowerCase())}
                )
                .slice(0, 6)
                .map((collection, index) => (
                    <div
                        key={index}
                        style={{
                            ...styling.suggestion,
                            backgroundColor: hoveredIndex === index ? '#e7e8e8' : 'transparent',
                            color: hoveredIndex === index ? '#070707' : 'inherit',
                            borderRadius: hoveredIndex === index ? '5px' : '0',
                            padding: hoveredIndex === index ? '5px' : '0',
                        }}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        className={`${classNames.suggestion || ""}`}
                        onClick={() => {
                            if (collection.contract){
                            handleSuggestionClick(collection.contract);
                            }
                        }}
                    >
                        <MediaRenderer 
                            src={collection.image} 
                            alt={collection.contract}
                            style={styling.suggestionLogo}
                            className={`${classNames.suggestionLogo || ""}`} 
                            width={"20px"} 
                            height={"20px"}
                        />
                        <span>{collection.name}</span>
                    </div>
                ))
            :
                <div
                    style={styling.suggestion}
                    className={`${classNames.suggestion || ""}`}
                >
                    <span>{'No Collection Found'}</span>
                </div>
            }
        </div>
        )}
    </div>
  );
};

export default NFTSearcher;