import { Service } from 'typedi';

import BootstrapProvider from '@Providers/BootstrapProvider';
import HttpProvider from '@Providers/HttpProvider';
import CacheProvider from '@Providers/CacheProvider';
import MongodbProvider from '@Providers/MongodbProvider';
import GraphqlProvider from '@Providers/GraphqlProvider';
import SocketProvider from '@Providers/SocketProvider';

@Service('kernel')
export class Kernel {
  //provider register
  public providers = [
    BootstrapProvider,
    CacheProvider,
    HttpProvider,
    // GraphqlProvider,
    MongodbProvider,
    SocketProvider,
  ];
}
