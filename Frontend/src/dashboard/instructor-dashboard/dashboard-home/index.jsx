import Breadcrumb from '../../../components/common/breadcrumb/DashboardBreadcrumb'
import FooterOne from '../../../layouts/footers/FooterOne'
import HeaderFour from '../../../layouts/headers/HeaderFour'
import HomeArea from './DashboardHomeArea'
import React from 'react';

const DashboardHome = () => {
  
  return (
    <>
      <HeaderFour />
      <main className="main-area fix">
        <Breadcrumb />
        <HomeArea />
      </main>
      <FooterOne />
    </>
  )
}

export default DashboardHome
