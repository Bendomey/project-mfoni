import * as express from 'express'

const router = express.Router()

router.use('/api', router)

export {router}
