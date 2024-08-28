'use client';

import NFTCard from '../../components/NFTCard';
import SectionTitle from '../../components/SectionTitle';
import { useWriteContract, useAccount } from 'wagmi'
import { abi as abiServiceNFT_A } from '../../../abi/ServiceNFT_A.json'
import { abi as abiEchoEcho } from '../../../abi/EchoEcho.json'
import { toast } from 'react-toastify';
import { client } from '../providers'
import { SetStateAction, useEffect, useState } from 'react';

export default function Page() {

  const [list, setList] = useState<any[]>([])

  useEffect(() => {
    client.getContractEvents({
      address: '0x37a20FB4FB275CCf658f508C29bba8f8Af93fD31',
      abi: abiEchoEcho,
      eventName: 'List',
      fromBlock: BigInt(6580040),
      toBlock: 'latest'
    }).then((res: any) => {
      console.log(res);
      getServiceInfo(res)
    })
  }, [])

  

  async function getServiceInfo(_list: any[]) {
    const getServiceInfos: any = _list.map((item: any) => ({
      address: '0x37a20FB4FB275CCf658f508C29bba8f8Af93fD31',
      abi: abiEchoEcho,
      functionName: 'getServiceInfo',
      args: [item.args.serviceInfoHash]
    }))
    const serviceInfos = await client.multicall({
      contracts: getServiceInfos
    })
    console.log(serviceInfos)
    const getUris: any = serviceInfos.map((item: any) => ({
      address: '0x153745F7FDc3BC2cF3E64FBFcCcE04A2f1B89554',
      abi: abiServiceNFT_A,
      functionName: 'tokenURI',
      args: [item.result.token_id]
    }))
    const uris = await client.multicall({
      contracts: getUris
    })
    console.log(uris);
    const fetchData = async (uri: string) => {
      const res = await fetch(`https://ipfs.io/ipfs/${uri}`)
      const metaData = await res.json()
      return metaData
    }
    const nftInfos = await Promise.all(uris.map((uri: any) => fetchData(uri.result)))
    console.log(nftInfos);

    setList(nftInfos.map((item: any, index: number) => ({
      ...item,
      status: 'listed',
      serviceInfo: serviceInfos[index].result
    })))    
  }

  return (
    <div>
      <SectionTitle title="Available Services" />
      <div className="flex flex-wrap -m-2">
        {
          list.map((item, index) => (
            <NFTCard key={index} {...item} />
          ))
        }
      </div>
    </div>
  );
}