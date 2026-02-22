import { RouterProvider, createRouter, createRoute, createRootRoute } from '@tanstack/react-router';
import Layout from './components/Layout';
import Home from './pages/Home';
import PdfToImageConverter from './pages/PdfToImageConverter';
import ImageToPdfConverter from './pages/ImageToPdfConverter';
import DocToPdfConverter from './pages/DocToPdfConverter';
import PdfToDocConverter from './pages/PdfToDocConverter';
import PdfSplitter from './pages/PdfSplitter';
import PdfMerge from './pages/PdfMerge';
import PdfUnlock from './pages/PdfUnlock';
import PdfEditor from './pages/PdfEditor';
import PdfTranslator from './pages/PdfTranslator';

const rootRoute = createRootRoute({
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
});

const pdfToImageRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pdf-to-image',
  component: PdfToImageConverter,
});

const imageToPdfRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/image-to-pdf',
  component: ImageToPdfConverter,
});

const docToPdfRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/doc-to-pdf',
  component: DocToPdfConverter,
});

const pdfToDocRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pdf-to-doc',
  component: PdfToDocConverter,
});

const splitPdfRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/split-pdf',
  component: PdfSplitter,
});

const mergePdfRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/merge-pdf',
  component: PdfMerge,
});

const unlockPdfRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/unlock-pdf',
  component: PdfUnlock,
});

const editPdfRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/edit-pdf',
  component: PdfEditor,
});

const translatePdfRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pdf-translator',
  component: PdfTranslator,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  pdfToImageRoute,
  imageToPdfRoute,
  docToPdfRoute,
  pdfToDocRoute,
  splitPdfRoute,
  mergePdfRoute,
  unlockPdfRoute,
  editPdfRoute,
  translatePdfRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function App() {
  return <RouterProvider router={router} />;
}

export default App;
