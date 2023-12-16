const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = require('../config/Database.js')
const userMiddleware = require('../middleware/UserModel.js')
var md5 = require('md5')
const fileUpload = require('express-fileupload')
const _ = require('lodash')
const mime = require('mime-types')
var bodyParser = require('body-parser')
var cors = require('cors')
var app = express()
app.use(cors())

app.use(
  fileUpload({
    createParentPath: true,
  }),
)

app.get('/getVehicle', (req, res, next) => {
  db.query(
    `SELECT 
      v.vehicle_id
      ,v.vehicle_no
      ,v.year_of_purchase
      ,v.model
      ,v.creation_date
      ,v.modification_date
      ,v.created_by
      ,v.modified_by
      ,v.total_fuel_amount 
      ,(SELECT SUM(amount) FROM vehicle_fuel WHERE vehicle_id=v.vehicle_id) AS fuel_amount
      ,(SELECT SUM(amount) FROM vehicle_service WHERE vehicle_id=v.vehicle_id) AS service_amount
      ,(SELECT renewal_date FROM vehicle_insurance WHERE vehicle_insurance_id=(SELECT Max(vehicle_insurance_id) FROM vehicle_insurance WHERE vehicle_id=v.vehicle_id)) AS vehicle_renewal_date
      ,v.insurance_renewal_date
      ,v.total_service_charge
      From vehicle v
      WHERE v.vehicle_id != ''`,
    (err, result) => {
      if (err) {
        console.log('error: ', err)
        return res.status(400).send({
          data: err,
          msg: 'failed',
        })
      } else {
        return res.status(200).send({
          data: result,
          msg: 'Success',
        })
      }
    },
  )
})

app.post('/getVehicleById', (req, res, next) => {
  db.query(
    `SELECT 
      v.vehicle_id
      ,v.vehicle_no
      ,v.year_of_purchase
      ,v.model
      ,v.creation_date
      ,v.modification_date
      ,v.created_by
      ,v.modified_by
      ,v.total_fuel_amount 
      ,(SELECT SUM(amount) FROM vehicle_fuel WHERE vehicle_id=v.vehicle_id) AS fuel_amount
      ,(SELECT SUM(amount) FROM vehicle_service WHERE vehicle_id=v.vehicle_id) AS service_amount
      ,(SELECT renewal_date FROM vehicle_insurance WHERE vehicle_insurance_id=(SELECT Max(vehicle_insurance_id) FROM vehicle_insurance WHERE vehicle_id=v.vehicle_id)) AS vehicle_renewal_date
      ,v.insurance_renewal_date
      ,v.total_service_charge
      From vehicle v
      WHERE v.vehicle_id= ${db.escape(req.body.vehicle_id)}`,
    (err, result) => {
      if (err) {
        return res.status(400).send({
          data: err,
          msg: 'Failed',
        })
      } else {
        return res.status(200).send({
          data: result[0],
          msg: 'Success',
        })
      }
    },
  )
})

app.post('/getVehicleFuelDataById', (req, res, next) => {
  db.query(
    `SELECT 
      vf.vehicle_id
      ,vf.date
      ,vf.liters
      ,vf.amount
      ,vf.vehicle_fuel_id
      From vehicle_fuel vf
      WHERE vf.vehicle_id = ${db.escape(
        req.body.vehicle_id,
      )}  ORDER BY vf.vehicle_fuel_id DESC `,
    (err, result) => {
      if (err) {
        console.log('error: ', err)
        return res.status(400).send({
          data: err,
          msg: 'failed',
        })
      } else {
        return res.status(200).send({
          data: result,
          msg: 'Success',
        })
      }
    },
  )
})

app.post('/getVehicleInsuranceDataById', (req, res, next) => {
  db.query(
    `SELECT 
      vi.vehicle_id
      ,vi.insurance_date
      ,vi.insurance_amount
      ,vi.renewal_date
      From vehicle_insurance vi
      WHERE vi.vehicle_id = ${db.escape(
        req.body.vehicle_id,
      )}  ORDER BY vi.vehicle_insurance_id DESC `,
    (err, result) => {
      if (err) {
        console.log('error: ', err)
        return res.status(400).send({
          data: err,
          msg: 'failed',
        })
      } else {
        return res.status(200).send({
          data: result,
          msg: 'Success',
        })
      }
    },
  )
})

app.post('/getVehicleServiceDataById', (req, res, next) => {
  db.query(
    `SELECT 
      vs.vehicle_id
      ,vs.date
      ,vs.amount
      ,vs.description
      From vehicle_service vs
      WHERE vs.vehicle_id = ${db.escape(
        req.body.vehicle_id,
      )}  ORDER By vs.vehicle_service_id DESC `,
    (err, result) => {
      if (err) {
        console.log('error: ', err)
        return res.status(400).send({
          data: err,
          msg: 'failed',
        })
      } else {
        return res.status(200).send({
          data: result,
          msg: 'Success',
        })
      }
    },
  )
})

app.post('/editVehicle', (req, res, next) => {
  db.query(
    `UPDATE vehicle
  SET vehicle_no=${db.escape(req.body.vehicle_no)}
  ,year_of_purchase=${db.escape(req.body.year_of_purchase)}
  ,model=${db.escape(req.body.model)}
  ,creation_date=${db.escape(req.body.creation_date)}
  ,modification_date=${db.escape(req.body.modification_date)}
  ,created_by=${db.escape(req.body.created_by)}
  ,modified_by=${db.escape(req.body.modified_by)}
  ,total_fuel_amount=${db.escape(req.body.fuel_amount)}
  ,insurance_renewal_date=${db.escape(req.body.renewal_date)}
  ,total_service_charge=${db.escape(req.body.service_amount)}
  WHERE vehicle_id = ${db.escape(req.body.vehicle_id)}`,
    (err, result) => {
      if (err) {
        console.log('error: ', err)
        return res.status(400).send({
          data: err,
          msg: 'failed',
        })
      } else {
        return res.status(200).send({
          data: result,
          msg: 'Success',
        })
      }
    },
  )
})

app.post('/insertVehicle', (req, res, next) => {
  let data = {
    vehicle_no: req.body.vehicle_no,
    year_of_purchase: req.body.year_of_purchase,
    model: req.body.model,
    creation_date: req.body.creation_date,
    modification_date: req.body.modification_date,
    created_by: req.body.created_by,
    modified_by: req.body.modified_by,
    total_fuel_amount: req.body.total_fuel_amount,
    insurance_renewal_date: req.body.insurance_renewal_date,
    total_service_charge: req.body.total_service_charge,
  }
  let sql = 'INSERT INTO vehicle SET ?'
  let query = db.query(sql, data, (err, result) => {
    if (err) {
      console.log('error: ', err)
      return res.status(400).send({
        data: err,
        msg: 'failed',
      })
    } else {
      return res.status(200).send({
        data: result,
        msg: 'Success',
      })
    }
  })
})

app.post('/editVehicleFuelDate', (req, res, next) => {
  db.query(
    `UPDATE vehicle_fuel
  SET date: ${db.escape(req.body.date)}
  WHERE vehicle_fuel_id = ${db.escape(req.body.vehicle_fuel_id)}`,
    (err, result) => {
      if (err) {
        console.log('error: ', err)
        return res.status(400).send({
          data: err,
          msg: 'failed',
        })
      } else {
        return res.status(200).send({
          data: result,
          msg: 'Success',
        })
      }
    },
  )
})

app.post('/insertVehicleFuelData', (req, res, next) => {
  let data = {
    vehicle_id: req.body.vehicle_id,
    date: req.body.date,
    amount: req.body.amount,
    liters: req.body.liters,
  }
  let sql = 'INSERT INTO vehicle_fuel SET ?'
  let query = db.query(sql, data, (err, result) => {
    if (err) {
      console.log('error: ', err)
      return res.status(400).send({
        data: err,
        msg: 'failed',
      })
    } else {
      return res.status(200).send({
        data: result,
        msg: 'Success',
      })
    }
  })
})

app.post('/insertVehicleInsuranceData', (req, res, next) => {
  let data = {
    vehicle_id: req.body.vehicle_id,
    insurance_date: req.body.insurance_date,
    insurance_amount: req.body.insurance_amount,
    renewal_date: req.body.renewal_date,
  }
  let sql = 'INSERT INTO vehicle_insurance SET ?'
  let query = db.query(sql, data, (err, result) => {
    if (err) {
      console.log('error: ', err)
      return res.status(400).send({
        data: err,
        msg: 'failed',
      })
    } else {
      return res.status(200).send({
        data: result,
        msg: 'Success',
      })
    }
  })
})

app.post('/insertVehicleServiceData', (req, res, next) => {
  let data = {
    vehicle_id: req.body.vehicle_id,
    date: req.body.date,
    amount: req.body.amount,
    description: req.body.description,
  }
  let sql = 'INSERT INTO vehicle_service SET ?'
  let query = db.query(sql, data, (err, result) => {
    if (err) {
      console.log('error: ', err)
      return res.status(400).send({
        data: err,
        msg: 'failed',
      })
    } else {
      return res.status(200).send({
        data: result,
        msg: 'Success',
      })
    }
  })
})

app.post('/deleteVehicle', (req, res, next) => {
  let data = { vehicle_id: req.body.vehicle_id }
  let sql = 'DELETE FROM vehicle WHERE ?'
  let query = db.query(sql, data, (err, result) => {
    if (err) {
      console.log('error: ', err)
      return res.status(400).send({
        data: err,
        msg: 'failed',
      })
    } else {
      return res.status(200).send({
        data: result,
        msg: 'Vehicle has been removed successfully',
      })
    }
  })
})

app.get('/secret-route', userMiddleware.isLoggedIn, (req, res, next) => {
  console.log(req.userData)
  res.send('This is the secret content. Only logged in users can see that!')
})

module.exports = app
